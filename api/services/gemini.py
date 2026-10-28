from __future__ import annotations

import json
import re
import time
import uuid
from typing import Any

import google.generativeai as genai
from fastapi import HTTPException

from config import get_settings
from schemas import (
    AlternativeItem,
    AnalyzeResult,
    AuthenticityResult,
    CompositionItem,
)

SYSTEM_RULES = """You are TrueMeds, a pharmaceutical packaging and chemistry analysis assistant.

Your job:
- Identify the medicine from packaging imagery when possible
- Assess authenticity signals from packaging (print quality, holograms, batch codes, spelling, layout)
- Extract chemical / active composition and strengths visible on the pack or generally known for that branded product
- Suggest therapeutically similar alternatives (same or related active ingredients), with brief reasons

STRICT RULES:
- Do NOT give dosage instructions, treatment plans, or claims that a product is safe to consume
- Do NOT diagnose conditions
- If unsure, use authenticity label "unknown" and lower confidence
- Prefer facts readable from the image; mark inference clearly in notes
- Respond with JSON only — no markdown fences
"""

ANALYZE_PROMPT = """Analyze this medicine packaging image.

Return a single JSON object with exactly these keys:
{
  "medicine_name": string or null,
  "authenticity": {
    "label": "authentic" | "suspicious" | "counterfeit" | "unknown",
    "confidence": number between 0 and 1,
    "signals": [string]
  },
  "composition": [{"ingredient": string, "strength": string or null}],
  "alternatives": [{"name": string, "reason": string, "same_actives": boolean}],
  "packaging_notes": [string],
  "disclaimer": "Informational only; not medical advice."
}
"""

# In-memory analysis store (analysis_id -> {bytes, mime, result, created})
_analyses: dict[str, dict[str, Any]] = {}
TTL_SECONDS = 3600
MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]


def _configure() -> None:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured")
    genai.configure(api_key=settings.gemini_api_key)


def _purge_expired() -> None:
    now = time.time()
    expired = [k for k, v in _analyses.items() if now - v["created"] > TTL_SECONDS]
    for k in expired:
        del _analyses[k]


def _extract_json(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        raise


def _normalize_result(raw: dict) -> AnalyzeResult:
    auth = raw.get("authenticity") or {}
    label = str(auth.get("label") or "unknown").lower()
    if label not in {"authentic", "suspicious", "counterfeit", "unknown"}:
        label = "unknown"
    try:
        confidence = float(auth.get("confidence", 0.5))
    except (TypeError, ValueError):
        confidence = 0.5
    confidence = max(0.0, min(1.0, confidence))

    composition = []
    for item in raw.get("composition") or []:
        if isinstance(item, dict) and item.get("ingredient"):
            composition.append(
                CompositionItem(
                    ingredient=str(item["ingredient"]),
                    strength=str(item["strength"]) if item.get("strength") else None,
                )
            )

    alternatives = []
    for item in raw.get("alternatives") or []:
        if isinstance(item, dict) and item.get("name"):
            alternatives.append(
                AlternativeItem(
                    name=str(item["name"]),
                    reason=str(item.get("reason") or ""),
                    same_actives=bool(item.get("same_actives", False)),
                )
            )

    notes = [str(n) for n in (raw.get("packaging_notes") or []) if n]

    return AnalyzeResult(
        medicine_name=raw.get("medicine_name"),
        authenticity=AuthenticityResult(
            label=label,
            confidence=confidence,
            signals=[str(s) for s in (auth.get("signals") or []) if s],
        ),
        composition=composition,
        alternatives=alternatives,
        packaging_notes=notes,
        disclaimer=str(raw.get("disclaimer") or "Informational only; not medical advice."),
    )


def _generate(parts: list) -> str:
    _configure()
    last_error: Exception | None = None
    for name in MODEL_CANDIDATES:
        try:
            model = genai.GenerativeModel(name, system_instruction=SYSTEM_RULES)
            response = model.generate_content(parts)
            if response.text:
                return response.text
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            continue
    raise HTTPException(
        status_code=502,
        detail=f"Gemini request failed: {last_error}",
    )


def analyze_image(image_bytes: bytes, mime_type: str) -> tuple[str, AnalyzeResult]:
    _purge_expired()
    if not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    text = _generate(
        [
            ANALYZE_PROMPT,
            {"mime_type": mime_type, "data": image_bytes},
        ]
    )
    try:
        raw = _extract_json(text)
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"Invalid model JSON: {exc}") from exc

    result = _normalize_result(raw)
    analysis_id = str(uuid.uuid4())
    _analyses[analysis_id] = {
        "bytes": image_bytes,
        "mime": mime_type,
        "result": result.model_dump(),
        "created": time.time(),
    }
    return analysis_id, result


def chat_about_analysis(analysis_id: str, message: str) -> str:
    _purge_expired()
    stored = _analyses.get(analysis_id)
    if not stored:
        raise HTTPException(status_code=404, detail="Analysis not found or expired")

    context = json.dumps(stored["result"], indent=2)
    prompt = f"""Prior analysis JSON:
{context}

User question: {message}

Answer briefly using the image and analysis. No dosage or treatment advice. Plain text only."""

    return _generate(
        [
            prompt,
            {"mime_type": stored["mime"], "data": stored["bytes"]},
        ]
    )


def analysis_exists(analysis_id: str) -> bool:
    _purge_expired()
    return analysis_id in _analyses

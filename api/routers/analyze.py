from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from deps import get_current_user
from models import User
from schemas import AnalyzeResponse, ChatRequest, ChatResponse
from services import gemini as gemini_service

router = APIRouter(prefix="/analyze", tags=["analyze"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
MAX_BYTES = 10 * 1024 * 1024


@router.post("", response_model=AnalyzeResponse)
async def analyze_medicine(
    file: UploadFile = File(...),
    _user: User = Depends(get_current_user),
):
    content_type = (file.content_type or "image/jpeg").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")

    analysis_id, result = gemini_service.analyze_image(data, content_type)
    return AnalyzeResponse(analysis_id=analysis_id, result=result)


@router.post("/chat", response_model=ChatResponse)
async def analyze_chat(
    body: ChatRequest,
    _user: User = Depends(get_current_user),
):
    reply = gemini_service.chat_about_analysis(body.analysis_id, body.message.strip())
    return ChatResponse(reply=reply)

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class SigninRequest(BaseModel):
    username: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    model_config = {"from_attributes": True}


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    user: UserOut
    tokens: TokenPair


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None


class AuthenticityResult(BaseModel):
    label: str
    confidence: float
    signals: List[str] = []


class CompositionItem(BaseModel):
    ingredient: str
    strength: Optional[str] = None


class AlternativeItem(BaseModel):
    name: str
    reason: str
    same_actives: bool = False


class AnalyzeResult(BaseModel):
    medicine_name: Optional[str] = None
    authenticity: AuthenticityResult
    composition: List[CompositionItem] = []
    alternatives: List[AlternativeItem] = []
    packaging_notes: List[str] = []
    disclaimer: str = "Informational only; not medical advice."


class AnalyzeResponse(BaseModel):
    analysis_id: str
    result: AnalyzeResult


class ChatRequest(BaseModel):
    analysis_id: str
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str

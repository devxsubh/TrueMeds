from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from deps import get_current_user
from models import User
from schemas import (
    AuthResponse,
    ProfileUpdate,
    RefreshRequest,
    SigninRequest,
    SignupRequest,
    TokenPair,
    UserOut,
)
from services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _tokens_for(user: User) -> TokenPair:
    return TokenPair(
        access_token=auth_service.create_access_token(user.id),
        refresh_token=auth_service.create_refresh_token(user.id),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if auth_service.get_user_by_username(db, body.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if auth_service.get_user_by_email(db, body.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=body.username.strip(),
        email=body.email.lower().strip(),
        password_hash=auth_service.hash_password(body.password),
        first_name=body.first_name,
        last_name=body.last_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(user=UserOut.model_validate(user), tokens=_tokens_for(user))


@router.post("/signin", response_model=AuthResponse)
def signin(body: SigninRequest, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_username(db, body.username)
    if not user or not auth_service.verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return AuthResponse(user=UserOut.model_validate(user), tokens=_tokens_for(user))


@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    user_id = auth_service.decode_token(body.refresh_token, "refresh")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = auth_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return _tokens_for(user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.put("/me", response_model=UserOut)
def update_me(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.email and body.email.lower() != user.email:
        existing = auth_service.get_user_by_email(db, body.email.lower())
        if existing and existing.id != user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = body.email.lower().strip()
    if body.first_name is not None:
        user.first_name = body.first_name
    if body.last_name is not None:
        user.last_name = body.last_name
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)

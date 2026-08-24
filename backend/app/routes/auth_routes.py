"""
/api/auth — signup + login. Issues a JWT the frontend stores and
sends back as Authorization: Bearer <token> on subsequent requests.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.db.database import get_db
from app.db import models as db_models
from app.models import schemas

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.AuthResponse)
def signup(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(db_models.User).filter_by(email=payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with that email already exists")

    user = db_models.User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.user_id)
    return schemas.AuthResponse(success=True, token=token, user=user)


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(db_models.User).filter_by(email=payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(user.user_id)
    return schemas.AuthResponse(success=True, token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: db_models.User = Depends(get_current_user)):
    return current_user

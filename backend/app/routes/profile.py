"""
/api/profile — logged-in user's profile, addresses, payment methods.
Every route here requires a valid JWT (via get_current_user).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db.database import get_db
from app.db import models as db_models
from app.models import schemas

router = APIRouter(prefix="/api/profile", tags=["profile"])


# ---- Profile ----

@router.get("", response_model=schemas.UserOut)
def get_profile(current_user: db_models.User = Depends(get_current_user)):
    return current_user


@router.put("", response_model=schemas.UserOut)
def update_profile(
    payload: schemas.ProfileUpdateRequest,
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.language_pref is not None:
        current_user.language_pref = payload.language_pref
    if payload.dietary_preferences is not None:
        current_user.dietary_preferences = payload.dietary_preferences
    db.commit()
    db.refresh(current_user)
    return current_user


# ---- Addresses ----

@router.get("/addresses", response_model=list[schemas.AddressOut])
def list_addresses(
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(db_models.Address).filter_by(user_id=current_user.user_id).all()


@router.post("/addresses", response_model=schemas.AddressOut)
def add_address(
    payload: schemas.AddressIn,
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.is_default:
        db.query(db_models.Address).filter_by(user_id=current_user.user_id).update({"is_default": False})
    address = db_models.Address(user_id=current_user.user_id, **payload.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/addresses/{address_id}", response_model=schemas.AddressOut)
def update_address(
    address_id: str,
    payload: schemas.AddressIn,
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = db.query(db_models.Address).filter_by(address_id=address_id, user_id=current_user.user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if payload.is_default:
        db.query(db_models.Address).filter_by(user_id=current_user.user_id).update({"is_default": False})
    for field, value in payload.model_dump().items():
        setattr(address, field, value)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/addresses/{address_id}")
def delete_address(
    address_id: str,
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = db.query(db_models.Address).filter_by(address_id=address_id, user_id=current_user.user_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(address)
    db.commit()
    return {"success": True}


# ---- Payment methods ----

@router.get("/payment-methods", response_model=list[schemas.PaymentMethodOut])
def list_payment_methods(
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(db_models.PaymentMethod).filter_by(user_id=current_user.user_id).all()


@router.post("/payment-methods", response_model=schemas.PaymentMethodOut)
def add_payment_method(
    payload: schemas.PaymentMethodIn,
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.is_default:
        db.query(db_models.PaymentMethod).filter_by(user_id=current_user.user_id).update({"is_default": False})
    method = db_models.PaymentMethod(user_id=current_user.user_id, **payload.model_dump())
    db.add(method)
    db.commit()
    db.refresh(method)
    return method


@router.delete("/payment-methods/{payment_id}")
def delete_payment_method(
    payment_id: str,
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    method = db.query(db_models.PaymentMethod).filter_by(payment_id=payment_id, user_id=current_user.user_id).first()
    if not method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    db.delete(method)
    db.commit()
    return {"success": True}

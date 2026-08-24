"""
/api/list — CRUD for the shopping list.
Matches the contract in Section 5 of the spec:
  POST /api/list        -> add / remove / modify
  GET  /api/list?user_id -> fetch active list
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models as db_models
from app.models import schemas
from app.services.categorizer import categorize

router = APIRouter(prefix="/api/list", tags=["list"])


@router.post("", response_model=schemas.ListActionResponse)
def modify_list(payload: schemas.ListActionRequest, db: Session = Depends(get_db)):
    if payload.action == "add":
        category = categorize(payload.item)

        # Try to match this item against the product catalog so we can
        # attach a price. ilike() does a case-insensitive substring match,
        # e.g. "milk" matches "Whole Milk", "Almond Milk", etc. — we just
        # take the first hit. Good enough for Phase 1; a fuzzier/ranked
        # match can replace this later without touching anything else.
        catalog_match = (
            db.query(db_models.ProductCatalog)
            .filter(db_models.ProductCatalog.name.ilike(f"%{payload.item}%"))
            .first()
        )
        price = catalog_match.price if catalog_match else None
        if catalog_match and catalog_match.category:
            category = catalog_match.category

        item = db_models.ShoppingListItem(
            user_id=payload.user_id,
            name=payload.item,
            quantity=payload.quantity or 1,
            unit=payload.unit,
            category=category,
            price=price,
            status=db_models.ItemStatus.active,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return schemas.ListActionResponse(success=True, item=item, category=category)

    if payload.action == "remove":
        if not payload.item_id:
            raise HTTPException(status_code=400, detail="item_id required to remove")
        item = db.query(db_models.ShoppingListItem).filter_by(
            item_id=payload.item_id, user_id=payload.user_id
        ).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        item.status = db_models.ItemStatus.removed
        db.commit()
        db.refresh(item)
        return schemas.ListActionResponse(success=True, item=item)

    if payload.action == "modify":
        if not payload.item_id:
            raise HTTPException(status_code=400, detail="item_id required to modify")
        item = db.query(db_models.ShoppingListItem).filter_by(
            item_id=payload.item_id, user_id=payload.user_id
        ).first()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        item.quantity = payload.quantity or item.quantity
        if payload.unit:
            item.unit = payload.unit
        db.commit()
        db.refresh(item)
        return schemas.ListActionResponse(success=True, item=item)

    raise HTTPException(status_code=400, detail="Unknown action")


@router.get("", response_model=schemas.ListGetResponse)
def get_list(user_id: str, db: Session = Depends(get_db)):
    items = (
        db.query(db_models.ShoppingListItem)
        .filter_by(user_id=user_id)
        .filter(db_models.ShoppingListItem.status == db_models.ItemStatus.active)
        .order_by(db_models.ShoppingListItem.created_at.desc())
        .all()
    )
    return schemas.ListGetResponse(items=items)
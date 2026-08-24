"""
/api/catalog — read-only browse endpoint for the product catalog.
Lets the frontend show a "Catalog" page with prices, and lets the
`/api/list` add branch look up prices by name (see routes/list.py).
"""

from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models as db_models

router = APIRouter(prefix="/api/catalog", tags=["catalog"])


@router.get("")
def list_catalog(q: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns all catalog products, optionally filtered by a case-insensitive
    substring match on name (e.g. ?q=milk matches "Milk", "Almond Milk").
    """
    query = db.query(db_models.ProductCatalog)
    if q:
        query = query.filter(db_models.ProductCatalog.name.ilike(f"%{q}%"))
    products = query.order_by(db_models.ProductCatalog.category, db_models.ProductCatalog.name).all()

    return {
        "products": [
            {
                "product_id": p.product_id,
                "name": p.name,
                "category": p.category,
                "price": float(p.price) if p.price is not None else None,
                "brand": p.brand,
                "size": p.size,
            }
            for p in products
        ]
    }


@router.get("/{product_id}")
def get_catalog_product(product_id: str, db: Session = Depends(get_db)):
    """Fetch a single catalog product by id — handy for a product detail view."""
    p = db.query(db_models.ProductCatalog).filter_by(product_id=product_id).first()
    if not p:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Product not found"}}
    return {
        "product_id": p.product_id,
        "name": p.name,
        "category": p.category,
        "price": float(p.price) if p.price is not None else None,
        "brand": p.brand,
        "size": p.size,
        "in_season": p.in_season,
        "tags": p.tags,
    }
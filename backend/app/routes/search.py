from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import ShoppingListItem, PurchaseHistory
from app.services.restock_service import get_restock_suggestions

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/search")
def search(q: str, db: Session = Depends(get_db)):
    list_matches = db.query(ShoppingListItem).filter(ShoppingListItem.name.ilike(f"%{q}%")).all()
    history_matches = db.query(PurchaseHistory).filter(PurchaseHistory.item_name.ilike(f"%{q}%")).all()
    return {
        "list_matches": [{"item_id": i.item_id, "name": i.name, "status": i.status} for i in list_matches],
        "history_matches": [{"item_name": h.item_name, "purchased_at": h.purchased_at} for h in history_matches]
    }

@router.get("/api/restock-suggestions")
def restock_suggestions(user_id: str, db: Session = Depends(get_db)):
    return {"suggestions": get_restock_suggestions(db, user_id)}

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models import PurchaseHistory

def get_restock_suggestions(db: Session, user_id: str):
    records = db.query(PurchaseHistory).filter(PurchaseHistory.user_id == user_id).all()
    suggestions = []
    for r in records:
        if r.frequency_days and r.purchased_at:
            due_date = r.purchased_at + timedelta(days=r.frequency_days)
            if due_date <= datetime.utcnow():
                suggestions.append({"item_name": r.item_name, "due_since": due_date})
    return suggestions

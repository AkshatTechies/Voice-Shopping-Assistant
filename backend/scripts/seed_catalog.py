"""
Phase 1 seed script: creates one dummy user so you can test /api/list
right away without building a signup flow.

Later (Phase 5) this file grows to also load data/product_catalog_sample.csv
and build embeddings — for now it just handles the user.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.database import SessionLocal, Base, engine
from app.db.models import User
from app.auth import hash_password

DUMMY_USER_ID = "00000000-0000-0000-0000-000000000001"
DUMMY_USER_PASSWORD = "password123"


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter_by(user_id=DUMMY_USER_ID).first()
        if existing:
            print(f"Dummy user already exists: {existing.user_id}")
            return

        user = User(
            user_id=DUMMY_USER_ID,
            name="Test User",
            email="test@example.com",
            password_hash=hash_password(DUMMY_USER_PASSWORD),
            language_pref="en",
        )
        db.add(user)
        db.commit()
        print(f"Created dummy user: {user.user_id}")
    finally:
        db.close()



SAMPLE_PRODUCTS = [
    # ---- Dairy ----
    {"name": "Milk", "category": "Dairy", "price": 28.00},
    {"name": "Almond Milk", "category": "Dairy", "price": 145.00},
    {"name": "Toned Milk", "category": "Dairy", "price": 26.00},
    {"name": "Eggs", "category": "Dairy", "price": 72.00},
    {"name": "Butter", "category": "Dairy", "price": 54.00},
    {"name": "Cheese Slices", "category": "Dairy", "price": 120.00},
    {"name": "Paneer", "category": "Dairy", "price": 90.00},
    {"name": "Curd", "category": "Dairy", "price": 30.00},
    {"name": "Greek Yogurt", "category": "Dairy", "price": 65.00},
    {"name": "Ghee", "category": "Dairy", "price": 560.00},

    # ---- Bakery ----
    {"name": "Bread", "category": "Bakery", "price": 40.00},
    {"name": "Whole Wheat Bread", "category": "Bakery", "price": 48.00},
    {"name": "Multigrain Bread", "category": "Bakery", "price": 55.00},
    {"name": "Buns", "category": "Bakery", "price": 35.00},
    {"name": "Croissant", "category": "Bakery", "price": 60.00},
    {"name": "Rusk", "category": "Bakery", "price": 45.00},

    # ---- Grains ----
    {"name": "Rice", "category": "Grains", "price": 65.00},
    {"name": "Basmati Rice", "category": "Grains", "price": 130.00},
    {"name": "Brown Rice", "category": "Grains", "price": 95.00},
    {"name": "Wheat Flour", "category": "Grains", "price": 48.00},
    {"name": "Multigrain Atta", "category": "Grains", "price": 85.00},
    {"name": "Oats", "category": "Grains", "price": 110.00},
    {"name": "Poha", "category": "Grains", "price": 55.00},
    {"name": "Vermicelli", "category": "Grains", "price": 40.00},

    # ---- Vegetables ----
    {"name": "Tomatoes", "category": "Vegetables", "price": 35.00},
    {"name": "Onions", "category": "Vegetables", "price": 30.00},
    {"name": "Potatoes", "category": "Vegetables", "price": 25.00},
    {"name": "Carrots", "category": "Vegetables", "price": 45.00},
    {"name": "Cucumber", "category": "Vegetables", "price": 30.00},
    {"name": "Spinach", "category": "Vegetables", "price": 20.00},
    {"name": "Capsicum", "category": "Vegetables", "price": 60.00},
    {"name": "Cauliflower", "category": "Vegetables", "price": 35.00},
    {"name": "Green Chillies", "category": "Vegetables", "price": 15.00},
    {"name": "Ginger", "category": "Vegetables", "price": 90.00},
    {"name": "Garlic", "category": "Vegetables", "price": 110.00},

    # ---- Fruits ----
    {"name": "Apples", "category": "Fruits", "price": 180.00},
    {"name": "Bananas", "category": "Fruits", "price": 50.00},
    {"name": "Oranges", "category": "Fruits", "price": 90.00},
    {"name": "Grapes", "category": "Fruits", "price": 110.00},
    {"name": "Mangoes", "category": "Fruits", "price": 150.00},
    {"name": "Pomegranate", "category": "Fruits", "price": 160.00},
    {"name": "Watermelon", "category": "Fruits", "price": 40.00},
    {"name": "Papaya", "category": "Fruits", "price": 45.00},

    # ---- Beverages ----
    {"name": "Orange Juice", "category": "Beverages", "price": 110.00},
    {"name": "Coffee", "category": "Beverages", "price": 220.00},
    {"name": "Tea", "category": "Beverages", "price": 150.00},
    {"name": "Green Tea", "category": "Beverages", "price": 180.00},
    {"name": "Soda", "category": "Beverages", "price": 40.00},
    {"name": "Mineral Water", "category": "Beverages", "price": 20.00},

    # ---- Snacks ----
    {"name": "Potato Chips", "category": "Snacks", "price": 20.00},
    {"name": "Biscuits", "category": "Snacks", "price": 30.00},
    {"name": "Namkeen", "category": "Snacks", "price": 45.00},
    {"name": "Peanut Butter", "category": "Snacks", "price": 190.00},
    {"name": "Chocolate", "category": "Snacks", "price": 60.00},
    {"name": "Mixed Nuts", "category": "Snacks", "price": 250.00},

    # ---- Pantry / Staples ----
    {"name": "Sugar", "category": "Pantry", "price": 44.00},
    {"name": "Salt", "category": "Pantry", "price": 22.00},
    {"name": "Cooking Oil", "category": "Pantry", "price": 150.00},
    {"name": "Toor Dal", "category": "Pantry", "price": 140.00},
    {"name": "Moong Dal", "category": "Pantry", "price": 130.00},
    {"name": "Chickpeas", "category": "Pantry", "price": 100.00},
    {"name": "Red Chilli Powder", "category": "Pantry", "price": 60.00},
    {"name": "Turmeric Powder", "category": "Pantry", "price": 45.00},

    # ---- Household ----
    {"name": "Dish Soap", "category": "Household", "price": 65.00},
    {"name": "Laundry Detergent", "category": "Household", "price": 180.00},
    {"name": "Toilet Paper", "category": "Household", "price": 90.00},
    {"name": "Trash Bags", "category": "Household", "price": 70.00},

    # ---- Personal Care ----
    {"name": "Shampoo", "category": "Personal Care", "price": 199.00},
    {"name": "Toothpaste", "category": "Personal Care", "price": 55.00},
    {"name": "Soap", "category": "Personal Care", "price": 35.00},
    {"name": "Hand Sanitizer", "category": "Personal Care", "price": 60.00},
]

def seed_catalog():
    from app.db.models import ProductCatalog
    db = SessionLocal()
    try:
        if db.query(ProductCatalog).count() > 0:
            print("Catalog already seeded.")
            return
        for p in SAMPLE_PRODUCTS:
            db.add(ProductCatalog(
                name=p["name"],
                category=p["category"],
                price=p["price"],
            ))
        db.commit()
        print(f"Seeded {len(SAMPLE_PRODUCTS)} catalog products.")
    finally:
        db.close()

def seed_purchase_history():
    from datetime import datetime, timedelta
    from app.db.models import PurchaseHistory
    db = SessionLocal()
    try:
        if db.query(PurchaseHistory).count() > 0:
            print("Purchase history already seeded.")
            return
        record = PurchaseHistory(
            user_id=DUMMY_USER_ID,
            item_name="Milk",
            category="Dairy",
            purchased_at=datetime.utcnow() - timedelta(days=10),
            frequency_days=7
        )
        db.add(record)
        db.commit()
        print("Seeded 1 purchase history record (Milk, due 3 days ago).")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
    seed_catalog()
    seed_purchase_history()
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.database import SessionLocal   # adjust import to your actual DB session
from app.db.models import ProductCatalog   # adjust to your actual model name
from app.services.vector_store import index_product

db = SessionLocal()
products = db.query(ProductCatalog).all()

for p in products:
    index_product(p.product_id, p.name, p.category)
    print(f"Indexed: {p.name}")

print(f"Done. Indexed {len(products)} products.")
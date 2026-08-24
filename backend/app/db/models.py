"""
SQLAlchemy models mirroring the schema in Section 4 of the spec.

Phase 1 only actively uses User + ShoppingListItem (for /api/list CRUD).
PurchaseHistory and ProductCatalog are defined now so the schema is
final and later phases (suggestions, search) don't need migrations.
"""

import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Numeric,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.types import TypeDecorator, TEXT
from sqlalchemy.orm import relationship
import json

from app.db.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class StringArray(TypeDecorator):
    """
    Stores a Python list as JSON text.
    SQLite has no native array type (unlike Postgres' ARRAY), so this
    keeps product_catalog.tags portable between SQLite (dev) and
    Postgres (prod) without changing the model code.
    """

    impl = TEXT

    def process_bind_param(self, value, dialect):
        return json.dumps(value) if value is not None else None

    def process_result_value(self, value, dialect):
        return json.loads(value) if value is not None else []


class ItemStatus(str, enum.Enum):
    active = "active"
    purchased = "purchased"
    removed = "removed"


class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    language_pref = Column(String, default="en")
    dietary_preferences = Column(StringArray, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("ShoppingListItem", back_populates="user")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")


class Address(Base):
    __tablename__ = "addresses"

    address_id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    label = Column(String, default="Home")  # Home / Work / Other
    line1 = Column(String, nullable=False)
    city = Column(String, nullable=False)
    pincode = Column(String, nullable=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="addresses")


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    payment_id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    type = Column(String, nullable=False)  # upi / card / cod
    # Display-only label — never store real card/UPI numbers here.
    # e.g. "UPI - name@bank" or "Card ending 4242"
    label = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="payment_methods")


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    item_id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    unit = Column(String, nullable=True)
    category = Column(String, nullable=True)
    price = Column(Numeric(10, 2), nullable=True)
    status = Column(Enum(ItemStatus), default=ItemStatus.active)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="items")


class PurchaseHistory(Base):
    __tablename__ = "purchase_history"

    history_id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    purchased_at = Column(DateTime, default=datetime.utcnow)
    frequency_days = Column(Integer, nullable=True)


class ProductCatalog(Base):
    __tablename__ = "product_catalog"

    product_id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    price = Column(Numeric(10, 2), nullable=True)
    size = Column(String, nullable=True)
    in_season = Column(Boolean, default=False)
    tags = Column(StringArray, default=list)
    embedding_id = Column(String, nullable=True)  # set once vector store exists (Phase 5)

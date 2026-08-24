"""
Very simple keyword-based categorizer.

This is intentionally basic for Phase 1 — just enough so /api/list
can return a `category` field per the API contract. It gets replaced
by proper LLM-based understanding in Phase 4 (nlu_service.py), and
this function can still be kept as a cheap fallback when the LLM is
unsure or unavailable.
"""

CATEGORY_KEYWORDS = {
    "dairy": ["milk", "cheese", "yogurt", "butter", "cream"],
    "produce": ["apple", "banana", "tomato", "onion", "potato", "strawberry", "spinach"],
    "bakery": ["bread", "bun", "bagel", "croissant"],
    "beverages": ["water", "juice", "soda", "coffee", "tea"],
    "meat": ["chicken", "beef", "pork", "fish", "egg", "eggs"],
    "pantry": ["rice", "pasta", "flour", "sugar", "salt", "oil"],
    "household": ["toothpaste", "soap", "detergent", "tissue", "shampoo"],
}


def categorize(item_name: str) -> str:
    name = item_name.lower().strip()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in name for keyword in keywords):
            return category
    return "uncategorized"

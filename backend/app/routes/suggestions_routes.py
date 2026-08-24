from fastapi import APIRouter
from app.services.vector_store import find_substitutes

router = APIRouter()

@router.get("/api/suggestions/{item_name}")
def get_suggestions(item_name: str):
    return {"substitutes": find_substitutes(item_name)}
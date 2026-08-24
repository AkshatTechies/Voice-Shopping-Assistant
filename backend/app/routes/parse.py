from fastapi import APIRouter
from pydantic import BaseModel
from httpx import AsyncClient, ASGITransport

from app.services.nlu_service import parse_command, NLUError

router = APIRouter()

EXECUTABLE_INTENTS = {"add_item", "remove_item", "modify_item"}


class ParseRequest(BaseModel):
    text: str
    user_id: str


def _error(code: str, message: str):
    return {"success": False, "error": {"code": code, "message": message}}


async def _call_list_endpoint(payload: dict) -> dict:
    # Lazy import avoids circular import (app.main imports this router).
    from app.main import app as fastapi_app

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://internal") as client:
        resp = await client.post("/api/list", json=payload, timeout=10)
        return resp.json()


@router.post("/api/parse")
async def parse_voice_command(req: ParseRequest):
    try:
        parsed = parse_command(req.text)
    except NLUError:
        return _error("PARSE_FAILED", "Could not understand that command, please try again")

    result = {
        "intent": parsed["intent"],
        "item": parsed["item"],
        "quantity": parsed["quantity"],
        "unit": parsed["unit"],
        "filters": parsed["filters"],
    }

    if parsed["intent"] not in EXECUTABLE_INTENTS:
        result["success"] = True
        return result

    if not parsed["item"]:
        return _error("PARSE_FAILED", "Could not identify an item in that command")

    action = parsed["intent"].removesuffix("_item")  # add_item -> add, etc.
    try:
        list_data = await _call_list_endpoint(
            {
                "user_id": req.user_id,
                "action": action,
                "item": parsed["item"],
                "quantity": parsed["quantity"],
                "unit": parsed["unit"],
            }
        )
    except Exception:
        return _error("LIST_ACTION_FAILED", "Command understood, but updating the list failed")

    result["list_result"] = list_data
    result["success"] = list_data.get("success", True) is not False
    return result

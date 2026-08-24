import json
import os
from groq import Groq

_client = None

SYSTEM_PROMPT = """You convert one shopping voice command into JSON. Return ONLY valid JSON, no prose, no markdown fences.
Schema:
{"intent": "add_item"|"remove_item"|"modify_item"|"search_item"|"unknown",
 "item": string|null,
 "quantity": number,
 "unit": string|null,
 "filters": {"max_price": number, "brand": string}|null}
Rules:
- "add"/"buy"/"need"/"want" -> add_item
- "remove"/"delete"/"take off" -> remove_item
- "change"/"update"/"make it N" -> modify_item
- "find"/"search"/"look for" -> search_item
- No quantity stated -> quantity = 1. No unit stated -> unit = null.
- Doesn't fit a shopping-list action -> intent = "unknown"."""


class NLUError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("LLM_API_KEY")
        if not api_key:
            raise NLUError("LLM_API_KEY is not set")
        _client = Groq(api_key=api_key)
    return _client


def parse_command(text: str) -> dict:
    client = _get_client()
    try:
        resp = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            max_tokens=200,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
        )
        raw = resp.choices[0].message.content.strip()
        for fence in ("```json", "```"):
            if raw.startswith(fence):
                raw = raw[len(fence):]
        raw = raw.strip().removesuffix("```").strip()
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise NLUError(f"LLM returned non-JSON output: {e}") from e
    except NLUError:
        raise
    except Exception as e:
        raise NLUError(f"LLM call failed: {e}") from e

    if "intent" not in data:
        raise NLUError("LLM output missing 'intent' field")
    data.setdefault("item", None)
    data.setdefault("quantity", 1)
    data.setdefault("unit", None)
    data.setdefault("filters", None)
    return data
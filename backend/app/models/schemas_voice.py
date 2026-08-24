"""
Schema additions for Phase 3 (voice/STT).

If you already have app/models/schemas.py from Phase 1, just append the
classes below into that file instead of keeping this as a separate module —
it's split out here only so it's easy to diff/merge.
"""

from pydantic import BaseModel


class VoiceResponse(BaseModel):
    transcript: str
    language: str


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

from app.services.stt_service import transcribe_audio, STTError

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/ogg",
}

MAX_FILE_SIZE_MB = 15


def _error(code: str, message: str, status_code: int = 400):
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "error": {"code": code, "message": message}},
    )


@router.post("/api/voice")
async def voice_to_text(audio: UploadFile = File(...)):
    content_type_base = (audio.content_type or "").split(";")[0].strip()
    if content_type_base not in ALLOWED_CONTENT_TYPES:
        return _error(
            "INVALID_FORMAT",
            f"Unsupported audio format: {audio.content_type}",
        )

    contents = await audio.read()
    size_mb = len(contents) / (1024 * 1024)

    if size_mb == 0:
        return _error("EMPTY_AUDIO", "Received empty audio file")

    if size_mb > MAX_FILE_SIZE_MB:
        return _error(
            "FILE_TOO_LARGE", f"Audio file exceeds {MAX_FILE_SIZE_MB}MB limit"
        )

    suffix = Path(audio.filename or "").suffix or ".webm"
    tmp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        result = transcribe_audio(tmp_path)
        return {"transcript": result["transcript"], "language": result["language"]}

    except STTError:
        # Message intentionally generic to the client per the API contract;
        # real cause is available in server logs via the raised exception.
        return _error(
            "STT_FAILED",
            "Could not process audio, please try again",
            status_code=500,
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

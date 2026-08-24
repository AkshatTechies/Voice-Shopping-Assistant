"""
Speech-to-Text service — wraps OpenAI Whisper.

Model is lazy-loaded on first real transcription call (not at import time).
This keeps app startup fast and means the rest of the app can boot even
before the (large) whisper package/model is fully set up.
"""

import os

_model = None
_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")


class STTError(Exception):
    """Raised whenever transcription cannot be completed."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def get_model():
    """Lazily import and load the Whisper model (heavy — only done once)."""
    global _model
    if _model is None:
        try:
            import whisper  # heavy dependency, imported lazily on purpose
        except ImportError as e:
            raise STTError(
                "Whisper is not installed. Run: pip install openai-whisper"
            ) from e
        try:
            _model = whisper.load_model(_MODEL_SIZE)
        except Exception as e:
            raise STTError(f"Failed to load Whisper model '{_MODEL_SIZE}': {e}") from e
    return _model


def transcribe_audio(file_path: str) -> dict:
    """
    Transcribe an audio file on disk to text.

    Returns: {"transcript": str, "language": str}
    Raises: STTError on any failure (missing ffmpeg, corrupt audio,
            no speech detected, model load failure, etc.)
    """
    model = get_model()

    try:
        result = model.transcribe(file_path)
    except FileNotFoundError as e:
        # Most commonly: ffmpeg is not installed / not on PATH
        raise STTError(
            "Audio could not be decoded. Is ffmpeg installed and on PATH?"
        ) from e
    except Exception as e:
        raise STTError(f"Whisper transcription failed: {e}") from e

    transcript = (result.get("text") or "").strip()
    language = result.get("language") or "en"

    if not transcript:
        raise STTError("No speech detected in audio")

    return {"transcript": transcript, "language": language}

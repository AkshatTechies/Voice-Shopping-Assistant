# Wiring voice.py into your existing main.py

Add these two lines to `backend/app/main.py` (same pattern you presumably
already used for the Phase 1 list routes):

```python
from app.routes import voice

app.include_router(voice.router)
```

That's it — `voice.py` defines the full `/api/voice` path itself via
`@router.post("/api/voice")`, so no prefix is needed on `include_router`.

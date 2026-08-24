"""
FastAPI entrypoint.

Phase 1: only the `list` router is wired in (CRUD on the shopping list
with dummy/local data). voice, parse, search, suggestions routers get
added in Phases 3-6 — their route files don't exist yet, so they're
commented out below as a map of what's coming.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.routes import list as list_routes

from app.routes import voice as voice_routes
from app.routes import parse as parse_routes
from app.routes import search as search_routes
from app.routes import suggestions_routes
from app.routes import auth_routes
from app.routes import profile as profile_routes
from app.routes import catalog as catalog_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Voice Shopping Assistant API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before deploying (Phase 8)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(list_routes.router)
app.include_router(voice_routes.router)
app.include_router(parse_routes.router)
app.include_router(suggestions_routes.router)
app.include_router(search_routes.router)
app.include_router(catalog_routes.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "voice-shopping-assistant-backend"}
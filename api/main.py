from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from db import init_db
from routers import analyze, auth


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


settings = get_settings()

app = FastAPI(
    title="TrueMeds API",
    description="Medicine packaging analysis: authenticity, composition, and alternatives",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")


@app.get("/")
def root():
    return {
        "service": "TrueMeds API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    return {"ok": True, "service": "truemeds"}

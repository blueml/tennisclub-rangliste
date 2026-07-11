from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .routers import admin, auth, matches, ranking

app = FastAPI(title="TC Waldpark — Rangliste API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ranking.router)
app.include_router(matches.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}

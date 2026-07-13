import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .routers import admin, auth, matches, ranking

logger = logging.getLogger("rangliste.http")
logging.basicConfig(level=logging.INFO, format="%(message)s")

app = FastAPI(title="TC Rösrath — Rangliste API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Logs every request and response in full, including bodies. Passwords in
# request bodies (login, change-password, create-player) are redacted before
# logging — everything else is printed verbatim. This is a debugging aid
# only: keep it disabled or heavily filtered in a real production deployment,
# since it necessarily logs cookies/headers and player emails.
REDACT_KEYS = {"password", "newpassword", "initialpassword"}


def _redact(raw: bytes) -> str:
    if not raw:
        return ""
    try:
        import json

        data = json.loads(raw)
        if isinstance(data, dict):
            data = {k: ("***" if k.lower() in REDACT_KEYS else v) for k, v in data.items()}
        return json.dumps(data, ensure_ascii=False)
    except Exception:
        return raw.decode("utf-8", errors="replace")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.monotonic()
    req_body = await request.body()

    # Body was already consumed above; make it re-readable for the actual handler.
    async def receive():
        return {"type": "http.request", "body": req_body, "more_body": False}

    request._receive = receive

    logger.info(
        "--> %s %s\n    headers: %s\n    body: %s",
        request.method,
        request.url.path + (("?" + request.url.query) if request.url.query else ""),
        dict(request.headers),
        _redact(req_body),
    )

    response = await call_next(request)

    resp_body = b""
    async for chunk in response.body_iterator:
        resp_body += chunk
    duration_ms = (time.monotonic() - start) * 1000

    logger.info(
        "<-- %s %s %s (%.1fms)\n    body: %s",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        _redact(resp_body),
    )

    from starlette.responses import Response

    return Response(
        content=resp_body,
        status_code=response.status_code,
        headers=dict(response.headers),
        media_type=response.media_type,
    )


app.include_router(auth.router)
app.include_router(ranking.router)
app.include_router(matches.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}

import time

import bcrypt
import jwt
from fastapi import HTTPException, Request, status

from .config import JWT_ALGORITHM, JWT_EXPIRY_SECONDS, JWT_SECRET

COOKIE_NAME = "session"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_session_token(subject: str, role: str) -> str:
    payload = {"sub": subject, "role": role, "exp": int(time.time()) + JWT_EXPIRY_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_session_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültige oder abgelaufene Sitzung.")


def get_session(request: Request) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nicht angemeldet.")
    return decode_session_token(token)


def require_admin(request: Request) -> dict:
    session = get_session(request)
    if session.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nur für Admins.")
    return session


def require_player(request: Request) -> dict:
    session = get_session(request)
    if session.get("role") != "player":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nur für Spieler:innen.")
    return session

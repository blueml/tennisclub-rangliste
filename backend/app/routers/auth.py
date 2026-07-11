from fastapi import APIRouter, Depends, HTTPException, Response

from ..admins import load_admins
from ..models import AdminLoginRequest, ChangePasswordRequest, PlayerLoginRequest
from ..security import (
    COOKIE_NAME,
    create_session_token,
    hash_password,
    require_player,
    verify_password,
)
from ..stores import players_store

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_MAX_AGE = 60 * 60 * 24 * 7


@router.post("/player-login")
async def player_login(body: PlayerLoginRequest, response: Response):
    data = await players_store.read()
    player = next((p for p in data["players"] if p["email"].lower() == body.email.lower()), None)
    if not player or not verify_password(body.password, player["passwordHash"]):
        raise HTTPException(status_code=401, detail="E-Mail oder Kennwort ist falsch.")

    token = create_session_token(subject=player["id"], role="player")
    response.set_cookie(
        COOKIE_NAME, token, httponly=True, samesite="lax", secure=True, max_age=COOKIE_MAX_AGE
    )
    return {"id": player["id"], "name": player["name"], "mustChangePassword": player["mustChangePassword"]}


@router.post("/admin-login")
async def admin_login(body: AdminLoginRequest, response: Response):
    admins = load_admins()
    admin = next((a for a in admins if a["username"] == body.username), None)
    if not admin or not verify_password(body.password, admin["passwordHash"]):
        raise HTTPException(status_code=401, detail="Benutzername oder Kennwort ist falsch.")

    token = create_session_token(subject=admin["username"], role="admin")
    response.set_cookie(
        COOKIE_NAME, token, httponly=True, samesite="lax", secure=True, max_age=COOKIE_MAX_AGE
    )
    return {"username": admin["username"]}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"ok": True}


@router.post("/change-password")
async def change_password(body: ChangePasswordRequest, session: dict = Depends(require_player)):
    if len(body.newPassword) < 6:
        raise HTTPException(status_code=400, detail="Mindestens 6 Zeichen.")
    player_id = session["sub"]
    new_hash = hash_password(body.newPassword)

    def _mutate(data: dict):
        for p in data["players"]:
            if p["id"] == player_id:
                p["passwordHash"] = new_hash
                p["mustChangePassword"] = False
                break
        else:
            raise HTTPException(status_code=404, detail="Spieler:in nicht gefunden.")
        return data, None

    await players_store.mutate(_mutate)
    return {"ok": True}

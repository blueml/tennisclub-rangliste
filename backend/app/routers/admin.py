from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from ..models import AdminResolveRequest, CreatePlayerRequest
from ..ranking import apply_challenge_win
from ..security import hash_password, require_admin
from ..stores import matches_store, players_store

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/players")
async def create_player(body: CreatePlayerRequest, session: dict = Depends(require_admin)):
    password_hash = hash_password(body.initialPassword)

    def _mutate(data: dict):
        if any(p["email"].lower() == body.email.lower() for p in data["players"]):
            raise HTTPException(status_code=409, detail="E-Mail bereits vergeben.")
        player = {
            "id": "p_" + uuid4().hex[:10],
            "name": body.name,
            "email": body.email,
            "passwordHash": password_hash,
            "mustChangePassword": True,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        data["players"].append(player)
        data["ranking"].append(player["id"])
        return data, player

    player = await players_store.mutate(_mutate)
    return {"id": player["id"], "name": player["name"], "email": player["email"]}


@router.delete("/players/{player_id}")
async def delete_player(player_id: str, session: dict = Depends(require_admin)):
    matches_data = await matches_store.read()
    locked = any(
        m["status"] == "open" and player_id in (m["challengerId"], m["defenderId"])
        for m in matches_data["matches"]
    )
    if locked:
        raise HTTPException(status_code=409, detail="Kann nicht entfernt werden — hat ein offenes Match.")

    def _mutate(data: dict):
        data["players"] = [p for p in data["players"] if p["id"] != player_id]
        data["ranking"] = [pid for pid in data["ranking"] if pid != player_id]
        return data, None

    await players_store.mutate(_mutate)
    return {"ok": True}


@router.post("/matches/{match_id}/resolve")
async def admin_resolve(match_id: str, body: AdminResolveRequest, session: dict = Depends(require_admin)):
    def _find(data: dict):
        match = next((m for m in data["matches"] if m["id"] == match_id and m["status"] == "open"), None)
        if not match:
            raise HTTPException(status_code=404, detail="Match nicht gefunden oder bereits abgeschlossen.")
        return data, dict(match)

    match = await matches_store.mutate(_find)

    def _apply_rotation(state: dict):
        ranking = state["ranking"]
        challenger_idx = ranking.index(match["challengerId"])
        defender_idx = ranking.index(match["defenderId"])
        if body.winnerId == match["challengerId"]:
            state["ranking"] = apply_challenge_win(ranking, challenger_idx, defender_idx)
        return state, None

    await players_store.mutate(_apply_rotation)

    def _close(data: dict):
        for m in data["matches"]:
            if m["id"] == match_id:
                m["status"] = "resolved"
                m["resolvedAt"] = datetime.now(timezone.utc).isoformat()
                m["resolvedBy"] = session["sub"]
        return data, None

    await matches_store.mutate(_close)
    return {"ok": True, "winnerId": body.winnerId}


@router.post("/matches/{match_id}/cancel")
async def admin_cancel(match_id: str, session: dict = Depends(require_admin)):
    def _mutate(data: dict):
        match = next((m for m in data["matches"] if m["id"] == match_id and m["status"] == "open"), None)
        if not match:
            raise HTTPException(status_code=404, detail="Match nicht gefunden oder bereits abgeschlossen.")
        match["status"] = "cancelled"
        match["resolvedAt"] = datetime.now(timezone.utc).isoformat()
        match["resolvedBy"] = session["sub"]
        return data, None

    await matches_store.mutate(_mutate)
    return {"ok": True}

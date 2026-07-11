from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from ..models import ConfirmResultRequest, CreateMatchRequest
from ..ranking import apply_challenge_win, get_targets
from ..security import require_player
from ..stores import matches_store, players_store

router = APIRouter(prefix="/api/matches", tags=["matches"])


def _is_locked(matches: list, player_id: str) -> bool:
    return any(m["status"] == "open" and player_id in (m["challengerId"], m["defenderId"]) for m in matches)


@router.post("")
async def create_match(body: CreateMatchRequest, session: dict = Depends(require_player)):
    challenger_id = session["sub"]

    players_data = await players_store.read()
    challenger = next((p for p in players_data["players"] if p["id"] == challenger_id), None)
    if not challenger:
        raise HTTPException(status_code=404, detail="Unbekannte Spieler:in.")
    if challenger["mustChangePassword"]:
        raise HTTPException(status_code=403, detail="Bitte zuerst das Kennwort ändern.")

    ranking = players_data["ranking"]
    if challenger_id not in ranking or body.defenderId not in ranking:
        raise HTTPException(status_code=404, detail="Unbekannte Position in der Rangliste.")

    challenger_idx = ranking.index(challenger_id)
    defender_idx = ranking.index(body.defenderId)
    left, above = get_targets(len(ranking), challenger_idx)
    if defender_idx not in left and defender_idx not in above:
        raise HTTPException(status_code=400, detail="Diese Person darf nicht herausgefordert werden.")

    def _mutate(data: dict):
        if _is_locked(data["matches"], challenger_id) or _is_locked(data["matches"], body.defenderId):
            raise HTTPException(status_code=409, detail="Eine der beiden Personen hat bereits ein offenes Match.")
        match = {
            "id": "m_" + uuid4().hex[:10],
            "challengerId": challenger_id,
            "defenderId": body.defenderId,
            "status": "open",
            "confirmations": {},
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "resolvedAt": None,
            "resolvedBy": None,
        }
        data["matches"].append(match)
        return data, match

    return await matches_store.mutate(_mutate)


@router.post("/{match_id}/confirm")
async def confirm_result(match_id: str, body: ConfirmResultRequest, session: dict = Depends(require_player)):
    self_id = session["sub"]

    def _record_confirmation(data: dict):
        match = next((m for m in data["matches"] if m["id"] == match_id and m["status"] == "open"), None)
        if not match:
            raise HTTPException(status_code=404, detail="Match nicht gefunden oder bereits abgeschlossen.")
        if self_id not in (match["challengerId"], match["defenderId"]):
            raise HTTPException(status_code=403, detail="Nur Beteiligte können ein Ergebnis bestätigen.")

        match["confirmations"][self_id] = body.winnerId
        c_conf = match["confirmations"].get(match["challengerId"])
        d_conf = match["confirmations"].get(match["defenderId"])
        agree = c_conf is not None and d_conf is not None and c_conf == d_conf
        return data, (dict(match), agree, c_conf if agree else None)

    match, agree, winner_id = await matches_store.mutate(_record_confirmation)
    if not agree:
        return {"status": "pending", "match": match}

    def _apply_rotation(state: dict):
        ranking = state["ranking"]
        challenger_idx = ranking.index(match["challengerId"])
        defender_idx = ranking.index(match["defenderId"])
        if winner_id == match["challengerId"]:
            state["ranking"] = apply_challenge_win(ranking, challenger_idx, defender_idx)
        return state, None

    await players_store.mutate(_apply_rotation)

    def _close(data: dict):
        for m in data["matches"]:
            if m["id"] == match_id:
                m["status"] = "resolved"
                m["resolvedAt"] = datetime.now(timezone.utc).isoformat()
        return data, None

    await matches_store.mutate(_close)
    return {"status": "resolved", "winnerId": winner_id}

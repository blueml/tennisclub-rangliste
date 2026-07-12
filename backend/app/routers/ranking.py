from fastapi import APIRouter, Depends

from ..security import get_session
from ..stores import matches_store, players_store

router = APIRouter(prefix="/api", tags=["ranking"])


@router.get("/ranking")
async def get_ranking(session: dict = Depends(get_session)):
    players_data = await players_store.read()
    matches_data = await matches_store.read()

    by_id = {p["id"]: p for p in players_data["players"]}
    is_admin = session.get("role") == "admin"
    ranking = []
    for idx, pid in enumerate(players_data["ranking"]):
        if pid not in by_id:
            continue
        entry = {"id": pid, "name": by_id[pid]["name"], "rank": idx + 1}
        # Email is only exposed to admins — other players don't need it and
        # it's personal data of the account, not part of the public ranking.
        if is_admin:
            entry["email"] = by_id[pid]["email"]
        ranking.append(entry)
    open_matches = [m for m in matches_data["matches"] if m["status"] == "open"]

    return {"ranking": ranking, "openMatches": open_matches}

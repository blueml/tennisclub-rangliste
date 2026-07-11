from .config import MATCHES_PATH, PLAYERS_PATH
from .store import JsonStore


def _default_players() -> dict:
    return {"players": [], "ranking": []}


def _default_matches() -> dict:
    return {"matches": []}


players_store = JsonStore(PLAYERS_PATH, _default_players)
matches_store = JsonStore(MATCHES_PATH, _default_matches)

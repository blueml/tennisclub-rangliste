import json

from .config import ADMINS_PATH


def load_admins() -> list[dict]:
    """Admins are maintained out-of-band in a read-only mounted config file —
    re-read on every login attempt so an ops-applied change doesn't need an
    app restart, but never written to by the application itself."""
    with open(ADMINS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

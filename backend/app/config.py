import os
from pathlib import Path

# Defaults are relative paths so the app also runs directly on a dev machine
# without Docker. docker-compose.yml overrides these to the absolute mount
# points (/config/admins.json, /data/players.json, /data/matches.json).
ADMINS_PATH = Path(os.environ.get("ADMINS_PATH", "config/admins.json"))
PLAYERS_PATH = Path(os.environ.get("PLAYERS_PATH", "data/players.json"))
MATCHES_PATH = Path(os.environ.get("MATCHES_PATH", "data/matches.json"))

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_SECONDS = 60 * 60 * 24 * 7  # 7 days

# Comma-separated list of allowed CORS origins (only relevant if the frontend
# is served from a different origin, e.g. a Vite dev server during development).
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

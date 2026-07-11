# TC Waldpark — Rangliste Backend

FastAPI-Backend (Passwort-Hashing über `bcrypt` direkt, kein passlib) passend zum Backend-Konzept (`Backend-Konzept Rangliste.dc.html`):
Single-Node, kein DB-Server, alle Daten in JSON-Dateien.

## Lokal starten (ohne Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Admin-Kennwort hashen und in config/admins.json eintragen:
python scripts/hash_password.py "Waldpark#2026"
# -> Hash in config/admins.json bei "passwordHash" eintragen

export JWT_SECRET="ein-langer-zufaelliger-string"
uvicorn app.main:app --reload --port 8080
```

`data/players.json` und `data/matches.json` werden beim ersten Start automatisch
mit einer leeren Struktur angelegt (kein Spieler, keine Matches) — Spieler:innen
legt der Admin über `POST /api/admin/players` an.

## Mit Docker

```bash
cd backend
python scripts/hash_password.py "Waldpark#2026"   # Hash in config/admins.json eintragen
echo "JWT_SECRET=ein-langer-zufaelliger-string" > .env
docker compose up --build
```

Die API läuft dann auf `http://localhost:8080`. `config/admins.json` wird
read-only in den Container gemountet; `data/` liegt auf einem benannten
Docker-Volume (`rangliste-data`), damit Spieler- und Match-Daten Container-
Neustarts überleben.

## Endpunkte

Siehe Abschnitt 6 in `Backend-Konzept Rangliste.dc.html` für die vollständige
Übersicht. Kurzfassung:

- `POST /api/auth/player-login`, `/admin-login`, `/logout`, `/change-password`
- `GET /api/ranking` — Rangliste + offene Matches
- `POST /api/matches` — Herausforderung eröffnen
- `POST /api/matches/{id}/confirm` — eigenes Ergebnis bestätigen (schließt bei
  Übereinstimmung beider Beteiligten automatisch)
- `POST /api/admin/players`, `DELETE /api/admin/players/{id}`
- `POST /api/admin/matches/{id}/resolve`, `/cancel` — Admin-Override, jederzeit

## Bekannte Einschränkungen dieses Stands

- Nur ein Uvicorn-Worker unterstützt — die Schreibsperre pro JSON-Datei ist ein
  `asyncio.Lock` im Prozess, kein dateisystemweiter Lock. Mehrere Worker/Prozesse
  würden sich gegenseitig überschreiben.
- `create_match` liest Spieler- und Match-Daten in zwei getrennten Schritten;
  ein theoretisches Race (Rangliste ändert sich zwischen den beiden Lesevorgängen)
  ist nicht abgesichert — für den Nutzungsumfang eines einzelnen Vereins
  vernachlässigbar, aber bei einem echten Ausbau erwähnenswert.
- Kein Rate-Limiting/Lockout auf Login-Versuche.

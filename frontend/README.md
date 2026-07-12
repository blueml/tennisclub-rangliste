# TC Waldpark — Rangliste Frontend

Vite + React Grundgerüst, das gegen das FastAPI-Backend (`../backend`) spricht.
Kein State-Simulation mehr wie im Klick-Prototyp (`Tennisclub Rangliste.dc.html`)
— alle Daten kommen über die echten `/api/...`-Endpunkte.

## Starten

```bash
cd frontend
npm install
npm run dev
```

Der Dev-Server läuft auf `http://localhost:5173` und leitet `/api/*` per Proxy
an das Backend weiter (Standard: `http://localhost:8080`, siehe `vite.config.js`
und `.env.example`). Backend vorher separat starten (siehe `../backend/README.md`).

## Build für Produktion

```bash
npm run build
```

Erzeugt `dist/` als statische Dateien. Diese können z. B. direkt von FastAPI
über `StaticFiles` ausgeliefert werden (ein Container für Frontend + Backend),
oder von einem beliebigen Static-Host hinter demselben Reverse-Proxy wie die API.

## Struktur

- `src/api.js` — einziger Ort mit `fetch`-Aufrufen gegen das Backend.
- `src/auth/AuthContext.jsx` — hält, wer eingeloggt ist (Rolle, Name/ID);
  die eigentliche Session steckt im httpOnly-Cookie, das der Browser
  automatisch mitschickt (`credentials: 'include'`).
- `src/lib/ranking.js` — dieselbe Baum-Mathematik wie im Backend
  (`backend/app/ranking.py`) und im Prototyp, rein fürs Rendering/Hervorheben
  gültiger Ziele; die Regelprüfung selbst passiert serverseitig.
- `src/pages/` — Login, Pflicht-Kennwortwechsel, Rangliste (Haupt-Screen).
- `src/components/` — Baum-Darstellung, offene Matches, Modals, Admin-Panel.

## Was noch fehlt / bewusst ausgelassen

- Kein globales Error-Boundary, kein Toast-System über ein einzelnes Banner
  hinaus — für den Umfang eines Grundgerüsts ausreichend.
- Kein automatisches Polling der Rangliste; nach jeder Aktion wird neu geladen.
  Für Echtzeit-Updates zwischen mehreren offenen Browsertabs müsste später
  Polling oder ein WebSocket ergänzt werden.

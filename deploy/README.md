# Deployment: Nginx + TLS vor Backend & Frontend

Setzt einen einzigen öffentlichen Einstiegspunkt (Port 80/443) vor den
FastAPI-Container und das gebaute React-Frontend. Passend zum
Single-Node-Konzept — kein zusätzlicher Cloud-Loadbalancer nötig.

## Voraussetzungen

- Ein Linux-Host mit Docker + Docker Compose.
- Eine Domain, die auf die öffentliche IP des Hosts zeigt (z. B. `www.annotationist.de`).
- Ports 80 und 443 am Host/Router freigegeben.

## 1. Frontend bauen

```bash
cd frontend
npm install
npm run build   # erzeugt frontend/dist
```

## 2. Domain in der Config eintragen

In `deploy/nginx/nginx.conf` alle Vorkommen von `www.annotationist.de` durch
die echte Domain ersetzen. Ebenso `CORS_ORIGINS` in `deploy/docker-compose.yml`.

## 3. Erstes TLS-Zertifikat holen

Der `certbot`-Service in `docker-compose.yml` erneuert nur ein bereits
vorhandenes Zertifikat — das allererste muss einmalig angefordert werden,
weil nginx sonst keine gültige `ssl_certificate`-Datei zum Starten findet:

```bash
cd deploy
docker compose up -d nginx   # startet vorerst nur auf Port 80 (redirect schlägt fehl, ist ok)
docker run --rm \
  -v deploy_certbot-www:/var/www/certbot \
  -v deploy_certbot-conf:/etc/letsencrypt \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d www.annotationist.de --agree-tos -m blueml@blueml-it.de --no-eff-email
docker compose restart nginx
```

## 4. Admin-Kennwort hashen und alles starten

```bash
python ../backend/scripts/hash_password.py "Waldpark#2026"
# Hash in ../backend/config/admins.json eintragen
echo "JWT_SECRET=ein-langer-zufaelliger-string" > .env
docker compose up -d --build
```

Die Anwendung ist danach unter `https://www.annotationist.de` erreichbar.
`certbot` läuft dauerhaft mit und erneuert das Zertifikat automatisch, bevor
es abläuft.

## Warum kein direktes Port-Mapping auf das Backend?

Der `backend`-Service hat bewusst **keinen** `ports:`-Eintrag — er ist nur
innerhalb des Compose-Netzwerks erreichbar (`http://backend:8080`), niemals
direkt vom Internet aus. Nginx ist der einzige öffentlich erreichbare
Dienst; das hält Angriffsfläche und TLS-Terminierung an einer Stelle.

## Frontend-Updates

Nach jeder Änderung am Frontend erneut `npm run build` ausführen — `dist/`
wird read-only in den `nginx`-Container gemountet, ein Neustart von nginx
ist danach nicht zwingend nötig (statische Dateien werden direkt vom
Volume gelesen).

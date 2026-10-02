# OAMS — Production Deployment (Contabo / any Ubuntu VPS)

This deploys the full Docker stack: **PostgreSQL 16 + Next.js (Node) app + nginx reverse
proxy + HTTPS**. Run from the **production VPS** (`root` / Ubuntu).

> Server example used here: `169.58.49.249` — replace with your real IP / domain.

---

## 0. Environment & prerequisites

- VPS: Ubuntu 22.04 / 24.04 (VPS ≥ 2 vCPU / 3–4 GB RAM recommended).
- A domain (optional but recommended). Without one the site runs on the raw IP.
- SSH already available: `ssh root@169.58.49.249`.

Update the server:

```bash
apt update && apt upgrade -y
```

### Install Docker + Compose plugin

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker --version
docker compose version   # should print v2.x
```

---

## 1. Get the code onto the server

```bash
mkdir -p /opt/oams && cd /opt/oams
# Either clone from git…
git clone https://github.com/zimzim2255/OAMS-WEBSITE.git .
# …or copy from your machine:
#   scp -r . root@169.58.49.249:/opt/oams/
```

---

## 2. Create the `.env` file

```bash
cd /opt/oams
nano .env
```

Minimal contents (for `docker-compose.yml`):

```env
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
JWT_SECRET=CHANGE_ME_VERY_LONG_RANDOM_STRING
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=CHANGE_ME_ADMIN_PASSWORD

# Optional — email (order notifications, support):
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
MAIL_FROM=OAMS <no-reply@your-domain.com>
```

`DATABASE_URL` / `DIRECT_URL` are provided automatically by `docker-compose.yml`
(they point at the internal `db` service), so you don't need to set them here.

Set real permissions on the file:

```bash
chmod 600 /opt/oams/.env
```

---

## 3. Build & start the stack

```bash
cd /opt/oams
docker compose up -d --build
docker compose ps          # db + app should be "running / healthy"
```

- App: `http://169.58.49.249:3000` (raw IP with port)
- DB: exposed on localhost `5432` for maintenance/imports.

---

## 4. Apply migrations

```bash
cd /opt/oams
docker compose exec app npx prisma migrate deploy
```

---

## 5. Import the catalogue (admin products) into the DB

> The production runner image does **not** include `src/` or `scripts/`, so run the
> import from the **host repo checkout**, pointing `DATABASE_URL` at the running
> Postgres container (exposed on `localhost:5432`).

```bash
cd /opt/oams
export DATABASE_URL="postgresql://oams:${POSTGRES_PASSWORD}@localhost:5432/oams?schema=public"
npx tsx scripts/import-products.ts
```

Expected: `Catalogue import complete: N created, 0 updated, M images written.`
You can re-run it safely any time (it's idempotent).

---

## 6. Point your domain at the server

In your domain registrar's DNS panel, create these **A records** to `169.58.49.249`:

```
your-domain.com   A  169.58.49.249
www               A  169.58.49.249
```

---

## 7. Reverse proxy + HTTPS (nginx + Certbot)

Install nginx and certbot:

```bash
apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/oams`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";   # websockets / dev HMR
        proxy_read_timeout 300s;
    }
}
```

Enable and get a TLS cert:

```bash
ln -s /etc/nginx/sites-available/oams /etc/nginx/sites-enabled/oams
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Now open `https://your-domain.com`.

---

## 8. Firewall (ufw)

Allow only what's needed (Docker publishes ports directly):

```bash
ufw allow OpenSSH
ufw allow 80,443/tcp
ufw allow 5432/tcp    # only if you need external DB access — otherwise skip, keep it localhost
ufw enable
```

> Security tip: by default `docker-compose.yml` publishes Postgres on all interfaces
> (`5432:5432`). For production, prefer binding to localhost (`127.0.0.1:5432:5432`)
> in `docker-compose.yml` so the DB isn't reachable from the internet.

---

## 9. Optional: Firebase-hosted static parts

Not needed here — this site is a full Node server (not static export), so the Docker app
containers are the source of truth. The `db:import:products` flow above has replaced any
front-end hardcoded products.

---

## Troubleshooting

| Symptom | Likely fix |
| --- | --- |
| `port is already allocated` | Postgres/port 3000 in use — `docker compose down` then up |
| OOM during `docker compose build` | Give the server more RAM or add `--memory`/swap |
| Site loads but no products | You skipped step 5 — run the import script |
| API hangs / 502 from nginx | `docker compose ps`; check `docker compose logs app` |
| JS chunks not loading | Ensure `NEXT_PUBLIC_SITE_URL` matches the real host |
# VPS deployment

This deployment targets a Debian or Ubuntu VPS with a domain name pointed at the server.

## Server layout

- Application code: `/opt/fitness-app`
- SQLite database: `/var/lib/fitness-app/fitness.sqlite`
- Environment file: `/etc/fitness-app.env`
- Systemd service: `/etc/systemd/system/fitness-app.service`
- Caddy config: `/etc/caddy/Caddyfile`

## First deployment

Install Node.js 22 or newer, Git, and Caddy using the appropriate packages for the VPS.

Create the service account and directories:

```bash
sudo useradd --system --home /opt/fitness-app --shell /usr/sbin/nologin fitness-app
sudo mkdir -p /opt/fitness-app /var/lib/fitness-app
sudo chown -R fitness-app:fitness-app /opt/fitness-app /var/lib/fitness-app
```

Clone the repository and build the frontend:

```bash
sudo -u fitness-app git clone https://github.com/Matt92-dev/fitness-app.git /opt/fitness-app
cd /opt/fitness-app
sudo -u fitness-app npm ci
sudo -u fitness-app npm run build
```

Create `/etc/fitness-app.env` from `.env.example`. Use a long random password:

```bash
sudo cp /opt/fitness-app/.env.example /etc/fitness-app.env
sudo chmod 600 /etc/fitness-app.env
sudo nano /etc/fitness-app.env
```

Install and start the service:

```bash
sudo cp /opt/fitness-app/deploy/fitness-app.service /etc/systemd/system/fitness-app.service
sudo systemctl daemon-reload
sudo systemctl enable --now fitness-app
curl http://127.0.0.1:3001/api/health
```

Copy `deploy/Caddyfile.example` to `/etc/caddy/Caddyfile`, replace the example domain, then reload Caddy:

```bash
sudo cp /opt/fitness-app/deploy/Caddyfile.example /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Updating later

```bash
cd /opt/fitness-app
sudo -u fitness-app git pull --ff-only
sudo -u fitness-app npm ci
sudo -u fitness-app npm run build
sudo systemctl restart fitness-app
```

## Notes

- The Node process listens only on `127.0.0.1`, so it is reached publicly through Caddy.
- Caddy handles HTTPS when the configured domain resolves to the VPS and ports `80` and `443` are open.
- The initial private-access layer is HTTP Basic authentication. Browsers will prompt for the configured credentials.

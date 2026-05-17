# Globis Edge Pi Deployment Runbook

This runbook installs and enables the Globis Edge local API, hotspot, PSK rotation,
and native GUI services on Raspberry Pi OS.

## 1) Prerequisites

- Raspberry Pi OS with `systemd`
- Python 3.11+
- `hostapd` and `dnsmasq` installed
- Repository deployed at `/opt/globis-edge`
- Service account `globis` created

## 2) Install Python Environment

```bash
cd /opt/globis-edge
python3 -m venv .venv
.venv/bin/pip install -e ".[dev,ui]"
```

## 3) Install Systemd Units

```bash
sudo cp deployment/systemd/globis-edge-api.service /etc/systemd/system/
sudo cp deployment/systemd/globis-edge-hotspot.service /etc/systemd/system/
sudo cp deployment/systemd/globis-edge-ui.service /etc/systemd/system/
sudo cp deployment/systemd/globis-edge-psk-rotate.service /etc/systemd/system/
sudo cp deployment/systemd/globis-edge-psk-rotate.timer /etc/systemd/system/
sudo chmod +x deployment/scripts/ensure_hotspot.sh
sudo chmod +x deployment/scripts/rotate_hotspot_psk.py
```

## 4) Runtime Environment

Set required environment in a secure unit drop-in, for example:

```bash
sudo systemctl edit globis-edge-api.service
```

Add:

```ini
[Service]
Environment=DEVICE_ID=pi-001
Environment=DB_PATH=/var/lib/globis-edge/globis.db
Environment=GOVERNANCE_DIR=/opt/globis-edge/governance
Environment=CASEWORKER_PIN=1234
Environment=SALT_HEX=0123456789abcdef0123456789abcdef
Environment=ENFORCE_LOCAL_ROUTE=true
Environment=GLOBIS_BIND_HOST=127.0.0.1
```

For GUI PIN:

```bash
sudo systemctl edit globis-edge-ui.service
```

Add:

```ini
[Service]
Environment=GLOBIS_CASEWORKER_PIN=1234
```

## 5) Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable globis-edge-hotspot.service
sudo systemctl enable globis-edge-api.service
sudo systemctl enable globis-edge-ui.service
sudo systemctl enable globis-edge-psk-rotate.timer
sudo systemctl start globis-edge-hotspot.service
sudo systemctl start globis-edge-api.service
sudo systemctl start globis-edge-ui.service
sudo systemctl start globis-edge-psk-rotate.timer
```

## 6) Verify

```bash
systemctl status globis-edge-hotspot.service --no-pager
systemctl status globis-edge-api.service --no-pager
systemctl status globis-edge-ui.service --no-pager
curl -s http://127.0.0.1:8080/system/status
curl -s http://127.0.0.1:8080/system/network
```

## 7) Security and Scope Locks

- Runtime blocks commits without `"SYNTHETIC SCENARIO"` watermark.
- Runtime fails startup if default route is outside `192.168.0.0/16` when
  `ENFORCE_LOCAL_ROUTE=true`.
- API bind host must stay loopback or `192.168.0.0/16`.
- `/commit` remains the sole outbox egress path.

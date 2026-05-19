# Globis Edge 2.0 — Field Hotspot Setup

Any phone (Android/iOS) or laptop (Mac/Windows/Linux) that joins the Pi 5's
Wi-Fi network can open the full 6-screen intake wizard in a browser. No app
install, no internet, no QR scanning — just Wi-Fi + browser.

---

## How it works

```
[ Phone / Laptop ]
        |
    Wi-Fi (WPA2)
   globis-edge-local
        |
  [ Raspberry Pi 5 ]
    192.168.50.1:8080
        |
   FastAPI (main.py)
   ├── /app  → React UI (built dist/)
   └── /api  → Gemma 4 inference endpoints
```

The Pi broadcasts its own isolated Wi-Fi network. There is no uplink to the
internet — clients can only reach the Pi itself.

---

## One-time Pi 5 setup

### Step 1 — Run the hotspot script

SSH into the Pi (over ethernet or existing Wi-Fi), then:

```bash
cd ~/globis-edge
sudo bash scripts/setup_hotspot.sh --psk "YourSecurePassphrase123!"
sudo reboot
```

After reboot, `globis-edge-local` will be visible in Wi-Fi settings on any device.

**Change the passphrase before field deployment** — the default is for testing only.

### Step 2 — Install the systemd service

```bash
# Copy the service file
sudo cp ~/globis-edge/scripts/globis-edge.service /etc/systemd/system/

# Edit the username if yours is not 'kukomo'
sudo nano /etc/systemd/system/globis-edge.service
# Change: User=kukomo  →  User=YOUR_USERNAME
# Change: WorkingDirectory and ExecStart paths to match

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable globis-edge
sudo systemctl start globis-edge

# Verify it's running
sudo systemctl status globis-edge
curl http://192.168.50.1:8080/health
```

Expected health response when Gemma 4 GGUF is present:
```json
{"status":"ok","mode":"live-gemma4-e2b","gemma_e2b_loaded":true}
```

Expected response in demo/no-GGUF mode:
```json
{"status":"ok","mode":"demo-shim","gemma_e2b_loaded":false}
```

### Step 3 — Deploy the built React UI

Run this on your **Mac** (not the Pi):

```bash
cd globis-edge-ui
npm run build

# Push the built UI to the Pi over SSH (while both on same network)
rsync -av --delete dist/ kukomo@192.168.50.1:~/globis-edge/globis-edge-ui/dist/
```

The API server automatically detects the `dist/` folder and serves it at `/app`.
No server restart needed — the mount is checked at process startup.

---

## Connecting devices

### Phone (Android or iPhone)
1. Go to **Settings → Wi-Fi**
2. Join **`globis-edge-local`** with your passphrase
3. Open browser → `http://192.168.50.1:8080/app`

### Mac laptop
1. Click Wi-Fi menu bar icon → join **`globis-edge-local`**
2. Open browser (any) → `http://192.168.50.1:8080/app`
   or use the mDNS name: `http://globis.local:8080/app`

### Windows laptop
Same as Mac. Windows may show a "This network has no internet" warning —
this is expected and correct. Click "Connect anyway".

### To bookmark conveniently on phones
On Android: Chrome → three-dot menu → "Add to Home screen"
On iPhone: Safari → Share → "Add to Home Screen"

This creates a home screen icon that opens the wizard like a native app.

---

## Security notes

| Control | Setting | Why |
|---|---|---|
| Wi-Fi encryption | WPA2-PSK, CCMP/AES only | No TKIP — prevents downgrade attacks |
| Network isolation | No internet uplink | Clients cannot reach anything except the Pi |
| AP binding | `192.168.50.1` only | Server refuses `0.0.0.0` binding by design |
| Max clients | 10 | Limits blast radius if PSK is leaked |
| DNS | Pi resolves locally, no upstream | No DNS leakage |
| systemd hardening | `NoNewPrivileges`, `PrivateTmp` | Process cannot escalate privileges |
| PSK rotation | Update `wpa_passphrase` in hostapd.conf + `systemctl restart hostapd` | Rotate between deployments |

**Rotate the passphrase between deployments:**
```bash
sudo nano /etc/hostapd/hostapd.conf
# Edit: wpa_passphrase=NEW_PASSPHRASE_HERE
sudo systemctl restart hostapd
```

---

## Troubleshooting

**Hotspot not visible after reboot:**
```bash
sudo systemctl status hostapd
sudo journalctl -u hostapd -n 50
```

**API not responding at 192.168.50.1:8080:**
```bash
sudo systemctl status globis-edge
sudo journalctl -u globis-edge -n 50
```

**UI shows blank page or 404:**
- The React UI hasn't been built yet. Run `npm run build` + `rsync` from your Mac (Step 3 above).
- Check: `ls ~/globis-edge/globis-edge-ui/dist/index.html`

**Client gets no IP from Pi:**
```bash
sudo systemctl status dnsmasq
sudo journalctl -u dnsmasq -n 30
```

**LAN binding error on startup:**
The server enforces LAN-only binding. If `192.168.50.1` isn't assigned yet when
the service starts, it will fail. Fix: add `After=hostapd.service` (already in
the service file) and ensure dhcpcd assigns the static IP before uvicorn starts.

---

## Quick reference — URLs on the hotspot

| URL | What it opens |
|---|---|
| `http://192.168.50.1:8080/app` | Full 6-screen intake wizard |
| `http://globis.local:8080/app` | Same (mDNS name, may not work on all Android) |
| `http://192.168.50.1:8080/health` | API health + Gemma 4 status |
| `http://192.168.50.1:8080/` | Pi 5 status dashboard (HTML) |
| `http://192.168.50.1:8080/docs` | FastAPI interactive docs |

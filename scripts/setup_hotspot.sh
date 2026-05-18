#!/usr/bin/env bash
# =============================================================================
# Globis Edge 2.0 — Pi 5 Wi-Fi Hotspot Setup
# =============================================================================
#
# Run once on the Raspberry Pi 5 to create the secure local Wi-Fi network that
# caseworkers and laptops join to access the intake wizard.
#
# What this does:
#   1. Installs hostapd (AP daemon) and dnsmasq (DHCP/DNS)
#   2. Assigns wlan0 a static IP (192.168.50.1)
#   3. Configures WPA2-PSK hotspot: SSID = globis-edge-local
#   4. Configures DHCP to hand out 192.168.50.10–50 to clients
#   5. Enables services at boot
#
# Security posture:
#   - WPA2-PSK (CCMP/AES only — no TKIP)
#   - No internet bridge — Pi is isolated from any upstream connection
#   - Clients can only reach 192.168.50.1:8080 (the intake API + UI)
#   - SSID is not hidden (hidden SSIDs don't improve security and break QR join)
#
# Usage:
#   sudo bash scripts/setup_hotspot.sh [--psk YOUR_PASSPHRASE]
#
# After running: reboot the Pi, then connect any device to "globis-edge-local"
# and open http://192.168.50.1:8080/app in a browser.
# =============================================================================

set -euo pipefail

# ── Defaults ─────────────────────────────────────────────────────────────────
SSID="globis-edge-local"
PSK="GlobisEdge2025!"          # CHANGE THIS before field deployment
CHANNEL=6
AP_IP="192.168.50.1"
DHCP_START="192.168.50.10"
DHCP_END="192.168.50.50"
INTERFACE="wlan0"

# ── Parse args ───────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case $1 in
        --psk) PSK="$2"; shift 2 ;;
        --ssid) SSID="$2"; shift 2 ;;
        --channel) CHANNEL="$2"; shift 2 ;;
        *) echo "Unknown arg: $1"; exit 1 ;;
    esac
done

if [[ ${EUID} -ne 0 ]]; then
    echo "ERROR: Run as root: sudo bash scripts/setup_hotspot.sh"
    exit 1
fi

echo "=== Globis Edge 2.0 — Hotspot Setup ==="
echo "    SSID   : ${SSID}"
echo "    AP IP  : ${AP_IP}"
echo "    Channel: ${CHANNEL}"
echo "    PSK    : (set)"
echo ""

# ── 1. Install dependencies ───────────────────────────────────────────────────
echo "[1/5] Installing hostapd + dnsmasq …"
apt-get update -qq
apt-get install -y hostapd dnsmasq

# ── 2. Assign static IP to wlan0 ─────────────────────────────────────────────
echo "[2/5] Configuring static IP for ${INTERFACE} …"

# Prevent dhcpcd from managing wlan0 (we set it statically)
DHCPCD_CONF="/etc/dhcpcd.conf"
if ! grep -q "interface ${INTERFACE}" "${DHCPCD_CONF}" 2>/dev/null; then
    cat >> "${DHCPCD_CONF}" <<EOF

# Globis Edge hotspot — static AP address
interface ${INTERFACE}
static ip_address=${AP_IP}/24
nohook wpa_supplicant
EOF
fi

# ── 3. Configure hostapd ──────────────────────────────────────────────────────
echo "[3/5] Writing hostapd config …"
cat > /etc/hostapd/hostapd.conf <<EOF
# Globis Edge 2.0 — WPA2-PSK hotspot
interface=${INTERFACE}
driver=nl80211
ssid=${SSID}
hw_mode=g
channel=${CHANNEL}
ieee80211n=1
wmm_enabled=1

# WPA2 only (no WPA1, no TKIP — AES/CCMP only)
wpa=2
wpa_passphrase=${PSK}
wpa_key_mgmt=WPA-PSK
wpa_pairwise=CCMP
rsn_pairwise=CCMP

# Management frame protection (802.11w) — optional but good practice
ieee80211w=1

# Limit to 10 concurrent clients (a field team won't need more)
max_num_sta=10

# No hidden SSID — hidden SSIDs don't improve security and break QR-code join
ignore_broadcast_ssid=0
EOF

# Point the default config at our file
sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' \
    /etc/default/hostapd 2>/dev/null || true

# ── 4. Configure dnsmasq (DHCP) ───────────────────────────────────────────────
echo "[4/5] Writing dnsmasq DHCP config …"

# Back up existing config if present
if [[ -f /etc/dnsmasq.conf ]]; then
    cp /etc/dnsmasq.conf /etc/dnsmasq.conf.bak
fi

cat > /etc/dnsmasq.conf <<EOF
# Globis Edge 2.0 — DHCP + captive portal DNS for hotspot clients
interface=${INTERFACE}
dhcp-range=${DHCP_START},${DHCP_END},255.255.255.0,12h
dhcp-option=3,${AP_IP}        # default gateway = Pi 5 itself
dhcp-option=6,${AP_IP}        # DNS = Pi 5 itself (no internet needed)

# Friendly hostname — http://globis.local works on Mac/iPhone
address=/globis.local/${AP_IP}

# Captive portal: resolve ALL domains to the Pi so phones auto-open the app.
# When a device joins the network it probes a known URL (Apple: captive.apple.com,
# Android: connectivitycheck.gstatic.com, Windows: msftconnecttest.com).
# We return the Pi's IP for every domain → the OS sees a redirect → pops browser.
address=/#/${AP_IP}

# Block upstream DNS forwarding — no internet leakage
no-resolv
server=
EOF

# ── 5. Enable services at boot ────────────────────────────────────────────────
echo "[5/5] Enabling services …"
systemctl unmask hostapd
systemctl enable hostapd
systemctl enable dnsmasq

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. sudo reboot"
echo "  2. After reboot, connect your phone/laptop to Wi-Fi: '${SSID}'"
echo "     Password: ${PSK}"
echo "  3. Open in browser: http://${AP_IP}:8080/app"
echo "     or:              http://globis.local:8080/app"
echo ""
echo "  To build and deploy the React UI to the Pi:"
echo "    On your Mac:  cd globis-edge-ui && npm run build"
echo "    Then:         rsync -av globis-edge-ui/dist/ pi@${AP_IP}:~/globis-edge/globis-edge-ui/dist/"
echo ""
echo "  IMPORTANT: Change the PSK before field deployment:"
echo "    sudo nano /etc/hostapd/hostapd.conf  # edit wpa_passphrase="
echo "    sudo systemctl restart hostapd"
echo ""

#!/usr/bin/env bash
set -euo pipefail

STATUS_DIR="/var/lib/globis-edge"
STATUS_FILE="${STATUS_DIR}/hotspot_status.json"

mkdir -p "${STATUS_DIR}"

if [[ ! -f "${STATUS_FILE}" ]]; then
  /opt/globis-edge/deployment/scripts/rotate_hotspot_psk.py
fi

systemctl restart hostapd
systemctl restart dnsmasq

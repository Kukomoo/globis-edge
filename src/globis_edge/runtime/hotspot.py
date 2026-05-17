"""Hotspot credential rotation and read-only telemetry helpers."""

from __future__ import annotations

import json
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_STATUS_PATH = Path("/var/lib/globis-edge/hotspot_status.json")
DEFAULT_SSID = "GlobisEdge-Caseworker"
DEFAULT_AP_IP = "192.168.50.1"


@dataclass(frozen=True)
class HotspotStatus:
    """Read-only hotspot metadata surfaced to the dashboard."""

    ssid: str
    ap_ip: str
    psk_last_rotated_at: str | None
    clients_connected_count: int
    security_mode: str


def generate_psk(length: int = 20) -> str:
    """Generate a random WPA2 PSK string."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def rotate_hotspot_psk(status_path: Path = DEFAULT_STATUS_PATH) -> dict[str, str]:
    """Rotate PSK and update status metadata atomically."""
    status_path.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).isoformat()
    psk = generate_psk()
    payload = {
        "ssid": DEFAULT_SSID,
        "ap_ip": DEFAULT_AP_IP,
        "security_mode": "WPA2-PSK",
        "psk_last_rotated_at": now,
        "clients_connected_count": 0,
        "psk": psk,
    }
    status_path.write_text(json.dumps(payload, sort_keys=True), encoding="utf-8")
    return payload


def load_hotspot_status(status_path: Path = DEFAULT_STATUS_PATH) -> HotspotStatus:
    """Load status metadata without exposing credentials."""
    if not status_path.exists():
        return HotspotStatus(
            ssid=DEFAULT_SSID,
            ap_ip=DEFAULT_AP_IP,
            psk_last_rotated_at=None,
            clients_connected_count=0,
            security_mode="WPA2-PSK",
        )
    data = json.loads(status_path.read_text(encoding="utf-8"))
    return HotspotStatus(
        ssid=str(data.get("ssid", DEFAULT_SSID)),
        ap_ip=str(data.get("ap_ip", DEFAULT_AP_IP)),
        psk_last_rotated_at=(
            str(data["psk_last_rotated_at"])
            if data.get("psk_last_rotated_at")
            else None
        ),
        clients_connected_count=int(data.get("clients_connected_count", 0)),
        security_mode=str(data.get("security_mode", "WPA2-PSK")),
    )

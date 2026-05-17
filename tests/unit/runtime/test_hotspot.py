"""Unit tests for hotspot PSK rotation and metadata masking."""

from __future__ import annotations

import json
from pathlib import Path

from globis_edge.runtime.hotspot import load_hotspot_status, rotate_hotspot_psk


def test_rotate_hotspot_psk_writes_status(tmp_path: Path) -> None:
    status_file = tmp_path / "hotspot_status.json"
    data = rotate_hotspot_psk(status_file)
    assert data["ssid"]
    assert data["psk"]
    assert len(data["psk"]) >= 16
    stored = json.loads(status_file.read_text(encoding="utf-8"))
    assert stored["security_mode"] == "WPA2-PSK"


def test_load_hotspot_status_masks_psk(tmp_path: Path) -> None:
    status_file = tmp_path / "hotspot_status.json"
    rotate_hotspot_psk(status_file)
    status = load_hotspot_status(status_file)
    dumped = status.__dict__
    assert "psk" not in dumped
    assert status.ap_ip.startswith("192.168.")

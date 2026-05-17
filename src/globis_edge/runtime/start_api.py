"""Systemd entrypoint for the local FastAPI server."""

from __future__ import annotations

import os

import uvicorn

from globis_edge.api.routes import NetworkStatusResponse, create_app
from globis_edge.config import bootstrap
from globis_edge.runtime.hotspot import load_hotspot_status
from globis_edge.store.sqlcipher import SQLCipherDB


def _network_provider() -> NetworkStatusResponse:
    status = load_hotspot_status()
    return NetworkStatusResponse(
        ssid=status.ssid,
        ap_ip=status.ap_ip,
        psk_last_rotated_at=status.psk_last_rotated_at,
        clients_connected_count=status.clients_connected_count,
        security_mode=status.security_mode,
    )


def main() -> None:
    cfg = bootstrap()
    bind_host = os.getenv("GLOBIS_BIND_HOST", "127.0.0.1")
    with SQLCipherDB(db_path=cfg.DB_PATH, db_key=cfg.DB_KEY or "") as db:
        app = create_app(
            db=db,
            device_id=cfg.DEVICE_ID,
            host=bind_host,
            network_status_provider=_network_provider,
        )
        uvicorn.run(app, host=bind_host, port=8080, log_level="info")


if __name__ == "__main__":
    main()

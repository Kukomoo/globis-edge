"""Systemd entrypoint for the native PySide6 caseworker GUI."""

from __future__ import annotations

import os
import sys

from globis_edge.ui.app import run_native_ui


def main() -> None:
    pin = os.getenv("GLOBIS_CASEWORKER_PIN", "")
    if not pin:
        raise RuntimeError("GLOBIS_CASEWORKER_PIN is required for UI startup")
    code = run_native_ui(pin=pin)
    raise SystemExit(code)


if __name__ == "__main__":
    main()

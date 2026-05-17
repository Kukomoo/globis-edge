#!/usr/bin/env python3
"""Rotate hotspot PSK metadata for Globis Edge AP mode."""

from __future__ import annotations

from globis_edge.runtime.hotspot import rotate_hotspot_psk


def main() -> None:
    rotate_hotspot_psk()


if __name__ == "__main__":
    main()

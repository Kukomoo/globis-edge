"""API package exports for the security-locked local server.

Imports are lazy so that importing globis_edge.api.main (the demo shim)
does not trigger the full production import chain (routes → constitution →
rules → sqlcipher3).  sqlcipher3 is only required when running routes.py.
"""

from __future__ import annotations

__all__ = ["BindingHostError", "create_app"]


def __getattr__(name: str):
    if name in ("BindingHostError", "create_app"):
        from .routes import BindingHostError, create_app  # noqa: PLC0415
        globals()["BindingHostError"] = BindingHostError
        globals()["create_app"] = create_app
        return globals()[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

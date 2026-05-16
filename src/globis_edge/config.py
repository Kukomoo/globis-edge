"""config.py — environment configuration and governance gate.

Process entry points (``cli.py``, ``server.py``) call :func:`bootstrap`
unconditionally before opening the database, loading any model, or binding
a socket. Bootstrap fails closed: any step that raises terminates the
process before resources are acquired.

Steps
-----
1. Load ``Config`` from environment (Pydantic-Settings). Required env vars
   missing → ``ValidationError``.
2. Validate governance files (``dpia.yaml``, ``dsa.yaml``). Missing file,
   mismatched hash, or expired DSA → :class:`GovernanceError`.
3. Derive ``DB_KEY`` via PBKDF2-SHA512 from the caseworker PIN and a
   device-scoped salt. Held in memory only — never written to disk.
4. Return the populated :class:`Config`.
"""

from __future__ import annotations

import hashlib
import os
from datetime import date
from pathlib import Path
from typing import Optional

import yaml
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_PBKDF2_ITERATIONS = 310_000
_PBKDF2_HASH = "sha512"


class GovernanceError(RuntimeError):
    """Raised when a governance file is missing, corrupt, or expired.

    Caught once at the CLI entry, which converts it to ``sys.exit(1)`` so
    the user-facing behaviour is: clear stderr message, exit code 1, no
    side effects.
    """


class Config(BaseSettings):
    """Process-wide configuration.

    Loaded from environment variables and (optionally) a ``.env`` file in
    the current working directory.

    Attributes:
        DEVICE_ID: Opaque per-device identifier. Used as the third component
            of the Lamport-clock compound key.
        DB_PATH: Filesystem path to the SQLCipher database file.
        GOVERNANCE_DIR: Directory containing ``dpia.yaml`` and ``dsa.yaml``.
        CASEWORKER_PIN: Used to derive ``DB_KEY``. Read once from env and
            never written to disk.
        DB_KEY: Derived inside :func:`bootstrap`; do not set directly.
        SALT_HEX: Hex-encoded device-scoped salt for PBKDF2.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    DEVICE_ID: str = Field(min_length=1)
    DB_PATH: str = Field(min_length=1)
    GOVERNANCE_DIR: str = Field(min_length=1)
    CASEWORKER_PIN: str = Field(min_length=4)
    SALT_HEX: str = Field(min_length=16)

    DB_KEY: Optional[str] = None


def _validate_governance(governance_dir: Path) -> None:
    """Validate that ``dpia.yaml`` and ``dsa.yaml`` are present and current.

    Raises :class:`GovernanceError` on any failure. The error message
    always names the offending file so the operator can act on it
    without reading the stack trace.
    """
    governance_dir = Path(governance_dir)
    dpia_path = governance_dir / "dpia.yaml"
    dsa_path = governance_dir / "dsa.yaml"

    # ---- dpia.yaml ----------------------------------------------------
    if not dpia_path.exists():
        raise GovernanceError(f"Governance file missing: {dpia_path}")
    try:
        dpia = yaml.safe_load(dpia_path.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError as exc:
        raise GovernanceError(f"dpia.yaml is malformed YAML: {exc}") from exc

    expected_hash = dpia.get("hash")
    if expected_hash is None:
        raise GovernanceError("dpia.yaml is missing the 'hash' field")

    # Hash everything except the hash line itself so the file can be
    # self-verifying without a chicken-and-egg problem.
    actual_hash = _content_hash_excluding_hash_line(dpia_path)
    if expected_hash != actual_hash:
        raise GovernanceError(
            f"dpia.yaml hash mismatch: expected {expected_hash}, "
            f"computed {actual_hash}"
        )

    # ---- dsa.yaml -----------------------------------------------------
    if not dsa_path.exists():
        raise GovernanceError(f"Governance file missing: {dsa_path}")
    try:
        dsa = yaml.safe_load(dsa_path.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError as exc:
        raise GovernanceError(f"dsa.yaml is malformed YAML: {exc}") from exc

    expiry_raw = dsa.get("expiry_date")
    if expiry_raw is None:
        raise GovernanceError("dsa.yaml is missing the 'expiry_date' field")

    try:
        expiry_date = (
            expiry_raw if isinstance(expiry_raw, date)
            else date.fromisoformat(str(expiry_raw))
        )
    except (TypeError, ValueError) as exc:
        raise GovernanceError(
            f"dsa.yaml expiry_date is not a valid ISO date: {expiry_raw!r}"
        ) from exc

    if expiry_date <= date.today():
        raise GovernanceError(
            f"dsa.yaml expired on {expiry_date.isoformat()}; refusing to start"
        )


def _content_hash_excluding_hash_line(path: Path) -> str:
    """Return sha256 of the file with the ``hash:`` line removed.

    Lets ``dpia.yaml`` carry its own hash without circular dependency.
    """
    content = path.read_text(encoding="utf-8")
    cleaned = "\n".join(
        line for line in content.splitlines() if not line.lstrip().startswith("hash:")
    )
    return hashlib.sha256(cleaned.encode("utf-8")).hexdigest()


def _derive_db_key(cfg: Config) -> str:
    """Derive the SQLCipher key from the caseworker PIN + device salt.

    PBKDF2-SHA512, 310,000 iterations. The result is returned as a hex
    string and stored on the :class:`Config` instance only — never written
    to disk and never returned by :func:`bootstrap` as a separate value.
    """
    salt = bytes.fromhex(cfg.SALT_HEX)
    derived = hashlib.pbkdf2_hmac(
        _PBKDF2_HASH,
        cfg.CASEWORKER_PIN.encode("utf-8"),
        salt,
        _PBKDF2_ITERATIONS,
    )
    return derived.hex()


def bootstrap() -> Config:
    """Validate environment and governance, derive the DB key, return Config.

    Order matters: env validation runs first (cheapest failure), governance
    second (file I/O), key derivation last (most expensive, only worth
    doing if the first two passed).
    """
    cfg = Config()  # raises ValidationError on missing env vars
    _validate_governance(Path(cfg.GOVERNANCE_DIR))
    cfg.DB_KEY = _derive_db_key(cfg)
    return cfg


def cli_entry() -> None:
    """Default entry point: bootstrap and report.

    Convenience for ``python -c "from globis_edge.config import cli_entry; cli_entry()"``
    and for the eventual ``globis-edge check-governance`` CLI command.
    Exits 0 on success, 1 on any :class:`GovernanceError`.
    """
    import sys

    try:
        bootstrap()
    except GovernanceError as exc:
        print(f"FATAL: {exc}", file=sys.stderr)
        sys.exit(1)
    except Exception as exc:  # ValidationError, anything else
        print(f"FATAL: {type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
    print("bootstrap ok", file=sys.stderr)
    sys.exit(0)


if __name__ == "__main__":
    cli_entry()

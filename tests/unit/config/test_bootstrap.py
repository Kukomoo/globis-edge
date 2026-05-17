"""Tests for the governance gate in config.bootstrap().

Verification plan: S1.6, S1.7.

The governance gate is the first thing the process does. Missing or
expired files must exit code 1 before any database, model, or socket is
touched.
"""

from __future__ import annotations

import hashlib
import subprocess
import sys
import textwrap
from datetime import date, timedelta
from pathlib import Path

import pytest

from globis_edge.config import GovernanceError, _validate_governance, bootstrap


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

VALID_DSA = textwrap.dedent(
    """\
    version: "1.0"
    partner: "TEST PARTNER"
    authoriser: "test"
    expiry_date: "{expiry}"
    permitted_fields: [name]
    """
)

VALID_DPIA_BODY = textwrap.dedent(
    """\
    version: "1.0"
    purpose_limitation: "test"
    data_minimisation_statement: "test"
    retention_policy: "test"
    """
)


def _compute_hash(body: str) -> str:
    """Sha256 of the YAML content excluding any 'hash:' line."""
    cleaned = "\n".join(
        line for line in body.splitlines() if not line.lstrip().startswith("hash:")
    )
    return hashlib.sha256(cleaned.encode("utf-8")).hexdigest()


def _write_governance(
    dir: Path, expiry: date, dpia_body: str | None = None
) -> None:
    """Write a fresh DPIA+DSA pair to ``dir`` with correct hash and given expiry."""
    dpia_body = dpia_body or VALID_DPIA_BODY
    h = _compute_hash(dpia_body)
    (dir / "dpia.yaml").write_text(
        dpia_body + f'hash: "{h}"\n', encoding="utf-8"
    )
    (dir / "dsa.yaml").write_text(
        VALID_DSA.format(expiry=expiry.isoformat()), encoding="utf-8"
    )


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------

def test_valid_governance_passes(tmp_path: Path) -> None:
    _write_governance(tmp_path, expiry=date.today() + timedelta(days=180))
    # Must return without raising.
    _validate_governance(tmp_path)


# ---------------------------------------------------------------------------
# S1.6 — Missing dsa.yaml
# ---------------------------------------------------------------------------

def test_S1_6_missing_dsa_raises_GovernanceError(tmp_path: Path) -> None:
    _write_governance(tmp_path, expiry=date.today() + timedelta(days=180))
    (tmp_path / "dsa.yaml").unlink()

    with pytest.raises(GovernanceError, match="dsa.yaml"):
        _validate_governance(tmp_path)


def test_S1_6_missing_dpia_raises_GovernanceError(tmp_path: Path) -> None:
    _write_governance(tmp_path, expiry=date.today() + timedelta(days=180))
    (tmp_path / "dpia.yaml").unlink()

    with pytest.raises(GovernanceError, match="dpia.yaml"):
        _validate_governance(tmp_path)


# ---------------------------------------------------------------------------
# S1.7 — Expired dsa.yaml
# ---------------------------------------------------------------------------

def test_S1_7_expired_dsa_raises_GovernanceError(tmp_path: Path) -> None:
    _write_governance(tmp_path, expiry=date(2025, 1, 1))

    with pytest.raises(GovernanceError, match="expired"):
        _validate_governance(tmp_path)


def test_S1_7_dsa_expiring_today_is_rejected(tmp_path: Path) -> None:
    """expiry_date == today is treated as expired (strictly future required)."""
    _write_governance(tmp_path, expiry=date.today())

    with pytest.raises(GovernanceError, match="expired"):
        _validate_governance(tmp_path)


# ---------------------------------------------------------------------------
# Hash mismatch
# ---------------------------------------------------------------------------

def test_dpia_hash_mismatch_raises(tmp_path: Path) -> None:
    _write_governance(tmp_path, expiry=date.today() + timedelta(days=180))

    # Tamper: append a line after the hash was computed.
    dpia_path = tmp_path / "dpia.yaml"
    dpia_path.write_text(
        dpia_path.read_text(encoding="utf-8") + "tampered: true\n", encoding="utf-8"
    )

    with pytest.raises(GovernanceError, match="hash mismatch"):
        _validate_governance(tmp_path)


# ---------------------------------------------------------------------------
# bootstrap() integration — proves end-to-end exit-1 behaviour via subprocess
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[3]


def _run_bootstrap_subprocess(
    tmp_path: Path,
    governance_dir: Path,
    db_path: Path,
) -> subprocess.CompletedProcess[str]:
    """Run cli_entry() in a clean subprocess with controlled env vars.

    Captures stderr/stdout/exit code. Mirrors how the real CLI starts up.
    """
    env = {
        "PATH": "/usr/bin:/bin",
        "DEVICE_ID": "device-test",
        "DB_PATH": str(db_path),
        "GOVERNANCE_DIR": str(governance_dir),
        "CASEWORKER_PIN": "1234",
        "SALT_HEX": "0123456789abcdef0123456789abcdef",
        "ENFORCE_LOCAL_ROUTE": "false",
    }
    return subprocess.run(
        [sys.executable, "-m", "globis_edge.config"],
        cwd=str(REPO_ROOT),
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )


def test_bootstrap_subprocess_exits_0_on_valid_governance(tmp_path: Path) -> None:
    governance_dir = tmp_path / "gov"
    governance_dir.mkdir()
    _write_governance(governance_dir, expiry=date.today() + timedelta(days=180))

    db_path = tmp_path / "test.db"
    result = _run_bootstrap_subprocess(tmp_path, governance_dir, db_path)

    assert result.returncode == 0, (
        f"bootstrap should exit 0; got {result.returncode}\nstderr: {result.stderr}"
    )


def test_bootstrap_subprocess_exits_1_on_missing_dsa(tmp_path: Path) -> None:
    governance_dir = tmp_path / "gov"
    governance_dir.mkdir()
    _write_governance(governance_dir, expiry=date.today() + timedelta(days=180))
    (governance_dir / "dsa.yaml").unlink()

    db_path = tmp_path / "test.db"
    result = _run_bootstrap_subprocess(tmp_path, governance_dir, db_path)

    assert result.returncode == 1
    assert "dsa.yaml" in result.stderr


def test_S1_7_bootstrap_subprocess_exits_1_on_expired_dsa(tmp_path: Path) -> None:
    """End-to-end proof: a real subprocess running bootstrap() exits 1
    when dsa.yaml is expired, with the word 'expired' in stderr."""
    governance_dir = tmp_path / "gov"
    governance_dir.mkdir()
    _write_governance(governance_dir, expiry=date(2025, 1, 1))

    db_path = tmp_path / "test.db"
    result = _run_bootstrap_subprocess(tmp_path, governance_dir, db_path)

    assert result.returncode == 1, (
        f"expected exit 1; got {result.returncode}\nstderr: {result.stderr}"
    )
    assert "expired" in result.stderr.lower()


def test_bootstrap_rejects_non_local_default_route(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    governance_dir = tmp_path / "gov"
    governance_dir.mkdir()
    _write_governance(governance_dir, expiry=date.today() + timedelta(days=90))

    monkeypatch.setenv("DEVICE_ID", "device-test")
    monkeypatch.setenv("DB_PATH", str(tmp_path / "db.sqlite"))
    monkeypatch.setenv("GOVERNANCE_DIR", str(governance_dir))
    monkeypatch.setenv("CASEWORKER_PIN", "1234")
    monkeypatch.setenv("SALT_HEX", "0123456789abcdef0123456789abcdef")
    monkeypatch.setenv("ENFORCE_LOCAL_ROUTE", "true")

    class _Result:
        stdout = "default via 10.0.0.1 dev eth0"

    monkeypatch.setattr(
        "globis_edge.config.subprocess.run",
        lambda *args, **kwargs: _Result(),
    )

    with pytest.raises(GovernanceError, match="outside 192.168.0.0/16"):
        bootstrap()

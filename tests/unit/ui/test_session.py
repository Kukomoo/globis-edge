"""Unit tests for session lock and inactivity controls."""

from __future__ import annotations

import pytest

from globis_edge.ui.session import SessionLockManager


def test_unlock_success_and_touch(monkeypatch: pytest.MonkeyPatch) -> None:
    t = [1000.0]
    monkeypatch.setattr("globis_edge.ui.session.time.time", lambda: t[0])
    manager = SessionLockManager(pin="1234", timeout_seconds=10)
    assert manager.unlock("1234") is True
    assert manager.state.locked is False
    t[0] = 1005.0
    manager.touch()
    assert manager.should_auto_lock() is False


def test_auto_lock_after_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    t = [2000.0]
    monkeypatch.setattr("globis_edge.ui.session.time.time", lambda: t[0])
    manager = SessionLockManager(pin="1234", timeout_seconds=5)
    manager.unlock("1234")
    t[0] = 2006.0
    manager.enforce_auto_lock()
    assert manager.state.locked is True


def test_failed_attempt_backoff(monkeypatch: pytest.MonkeyPatch) -> None:
    t = [3000.0]
    monkeypatch.setattr("globis_edge.ui.session.time.time", lambda: t[0])
    manager = SessionLockManager(pin="1234", max_failed_attempts=2, lockout_seconds=30)

    assert manager.unlock("0000") is False
    assert manager.unlock("1111") is False
    assert manager.unlock("1234") is False
    assert manager.state.locked is True

    t[0] = 3031.0
    assert manager.unlock("1234") is True

"""Session lock state machine for the caseworker desktop UI."""

from __future__ import annotations

import time
from dataclasses import dataclass


@dataclass(frozen=True)
class SessionState:
    """Immutable snapshot of session lock state."""

    locked: bool
    failed_attempts: int
    lockout_until_epoch: float
    last_activity_epoch: float
    timeout_seconds: int


class SessionLockManager:
    """PIN-gated session manager with timeout and failed-attempt backoff."""

    def __init__(
        self,
        *,
        pin: str,
        timeout_seconds: int = 300,
        max_failed_attempts: int = 3,
        lockout_seconds: int = 30,
    ) -> None:
        if not pin:
            raise ValueError("PIN cannot be empty")
        self._pin = pin
        self._timeout_seconds = timeout_seconds
        self._max_failed_attempts = max_failed_attempts
        self._lockout_seconds = lockout_seconds
        now = time.time()
        self._locked = True
        self._failed_attempts = 0
        self._lockout_until_epoch = 0.0
        self._last_activity_epoch = now

    def unlock(self, candidate_pin: str) -> bool:
        """Attempt to unlock the session with a PIN."""
        now = time.time()
        if now < self._lockout_until_epoch:
            self._locked = True
            return False
        if candidate_pin != self._pin:
            self._failed_attempts += 1
            if self._failed_attempts >= self._max_failed_attempts:
                self._lockout_until_epoch = now + self._lockout_seconds
                self._failed_attempts = 0
            self._locked = True
            return False
        self._failed_attempts = 0
        self._lockout_until_epoch = 0.0
        self._locked = False
        self.touch()
        return True

    def touch(self) -> None:
        """Refresh activity timestamp for an active session."""
        self._last_activity_epoch = time.time()

    def should_auto_lock(self) -> bool:
        """Return True when inactivity timeout expired."""
        if self._locked:
            return True
        return (time.time() - self._last_activity_epoch) >= self._timeout_seconds

    def enforce_auto_lock(self) -> None:
        """Lock session if inactivity timeout elapsed."""
        if self.should_auto_lock():
            self.lock()

    def lock(self) -> None:
        """Explicitly lock the session."""
        self._locked = True

    @property
    def state(self) -> SessionState:
        """Read-only session state snapshot."""
        return SessionState(
            locked=self._locked,
            failed_attempts=self._failed_attempts,
            lockout_until_epoch=self._lockout_until_epoch,
            last_activity_epoch=self._last_activity_epoch,
            timeout_seconds=self._timeout_seconds,
        )

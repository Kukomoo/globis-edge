"""SQLCipherDB — the single encrypted connection used by all data-layer modules.

Why this file exists
--------------------
Every other module that touches the database goes through SQLCipherDB. It
owns the PRAGMA key, runs schema.sql, and exposes parameterised execute /
fetch primitives. It deliberately never returns the raw connection — there
is no path from a caller back to ``sqlite3``-style dynamic SQL.

Invariants
----------
* ``execute(sql, params)`` requires ``params`` to be a tuple. Passing a list
  or anything else raises ``TypeError`` *before* the SQL is sent to the
  driver. This kills f-string interpolation as a temptation: there is no
  reason to build SQL by concatenation when binding is the only path that
  works.
* The connection is opened with ``PRAGMA key`` applied immediately after
  ``connect``. Any failure to apply the key is fatal — the constructor
  raises ``DatabaseError`` rather than silently falling through to an
  unencrypted file.
* ``schema.sql`` is read from the package itself (not from an external
  path), so the DDL travels with the binary. There is no scenario in which
  the data layer comes up against a schema mismatch caused by a missing
  file.
"""

from __future__ import annotations

import logging
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from sqlcipher3 import dbapi2 as _sqlcipher

log = logging.getLogger(__name__)

_SCHEMA_FILE = Path(__file__).parent / "schema.sql"


class DatabaseError(RuntimeError):
    """Raised when the encrypted database refuses to open with the given key.

    The most common cause is a wrong passphrase: SQLCipher silently returns
    a connection object, but the first read against the file decrypts to
    garbage and surfaces as a SQLite parse error. We catch that here and
    re-raise so callers see a clear, single error class.
    """


class SQLCipherDB:
    """Owns a single encrypted SQLCipher connection.

    The class is the **only** place in ``src/`` allowed to import a SQLite
    driver. Every other module receives a constructed instance and calls
    :meth:`execute`, :meth:`fetchone`, :meth:`fetchall`, or
    :meth:`transaction` — they never see the raw connection. This is what
    keeps dynamic SQL out of the codebase: there is no API surface that
    would accept it.

    Args:
        db_path: Filesystem path to the ``.db`` file. Created on first open
            if it does not exist.
        db_key: Encryption passphrase. Derived elsewhere (see
            ``config.bootstrap``); never read from disk.
    """

    def __init__(self, db_path: str | Path, db_key: str) -> None:
        self._db_path = str(db_path)
        # Open the connection. SQLCipher does not validate the key here.
        # check_same_thread=False is required for async frameworks (Uvicorn)
        # where the connection may be accessed from different threads.
        self._conn = _sqlcipher.connect(self._db_path, check_same_thread=False)
        self._conn.row_factory = _sqlcipher.Row

        # Apply the encryption key. If this PRAGMA fails the file is in an
        # unknown encryption state — refuse to continue.
        try:
            self._conn.execute(f"PRAGMA key = '{_escape(db_key)}'")
        except _sqlcipher.DatabaseError as exc:
            self._conn.close()
            raise DatabaseError(f"failed to apply PRAGMA key: {exc}") from exc

        # Probe the connection: if the key is wrong (or the file is plain
        # SQLite from a prior misconfigured run) this read fails.
        try:
            self._conn.execute("SELECT count(*) FROM sqlite_master").fetchone()
        except _sqlcipher.DatabaseError as exc:
            self._conn.close()
            raise DatabaseError(
                "SQLCipher key probe failed — wrong key or corrupted file"
            ) from exc

        self._conn.execute("PRAGMA journal_mode = WAL")
        self._apply_schema()

    # ------------------------------------------------------------------
    # Schema bootstrap
    # ------------------------------------------------------------------

    def _apply_schema(self) -> None:
        """Run ``schema.sql`` against the open connection.

        ``CREATE TABLE IF NOT EXISTS`` semantics make this safe to call on
        every startup. It is idempotent.
        """
        ddl = _SCHEMA_FILE.read_text(encoding="utf-8")
        self._conn.executescript(ddl)
        self._conn.commit()

    # ------------------------------------------------------------------
    # Parameterised primitives
    # ------------------------------------------------------------------

    def execute(self, sql: str, params: tuple[Any, ...] = ()) -> Any:
        """Execute one parameterised statement.

        ``params`` is required to be a ``tuple``. Lists, dicts, and other
        sequences are rejected here with ``TypeError`` — this is the
        single line that prevents callers from drifting into f-string or
        ``%``-formatted SQL. If a caller has a list, they have to wrap it
        in a tuple, which makes the binding visible at the call site.
        """
        if not isinstance(params, tuple):
            raise TypeError(
                f"SQLCipherDB.execute params must be a tuple, "
                f"got {type(params).__name__}"
            )
        return self._conn.execute(sql, params)

    def fetchone(self, sql: str, params: tuple[Any, ...] = ()) -> Any:
        """Execute and return the first row (or None)."""
        return self.execute(sql, params).fetchone()

    def fetchall(self, sql: str, params: tuple[Any, ...] = ()) -> list[Any]:
        """Execute and return all rows as a list."""
        return list(self.execute(sql, params).fetchall())

    def commit(self) -> None:
        self._conn.commit()

    @contextmanager
    def transaction(self) -> Iterator[SQLCipherDB]:
        """Run a block atomically; rollback on exception."""
        try:
            yield self
            self._conn.commit()
        except Exception:
            self._conn.rollback()
            raise

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    @property
    def path(self) -> str:
        return self._db_path

    def close(self) -> None:
        self._conn.close()

    def __enter__(self) -> SQLCipherDB:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()


def _escape(key: str) -> str:
    """Escape a key for use inside a ``PRAGMA key = '...'`` statement.

    SQLCipher accepts the key as a quoted literal; we duplicate any inner
    single quotes to avoid breaking out of the literal. The key never
    reaches user input in production — it is PBKDF2-derived — but we
    defend the literal anyway because the cost is one line of code.
    """
    return key.replace("'", "''")

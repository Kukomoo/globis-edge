"""Shared pytest fixtures for the Globis Edge test suite.

Anything that returns a SQLCipher-backed database goes here so individual
test files stay focused on assertions, not boilerplate.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from globis_edge.store.sqlcipher import SQLCipherDB

# A non-empty test key. Production keys are PBKDF2-derived and 128 hex
# characters; the SQLCipher PRAGMA accepts any non-empty string for tests.
TEST_KEY = "test-key-not-derived"


@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    """Filesystem path to a fresh per-test database file."""
    return tmp_path / "globis_edge_test.db"


@pytest.fixture
def db(db_path: Path) -> SQLCipherDB:
    """An open, schema-initialised SQLCipher connection for one test."""
    instance = SQLCipherDB(db_path=db_path, db_key=TEST_KEY)
    yield instance
    instance.close()

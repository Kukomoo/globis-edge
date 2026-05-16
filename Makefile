# Globis Edge 2.0 — Makefile
# Requires Python 3.11+ and pysqlcipher3 on the target device.
# On the Kaggle/sandbox environment (Python 3.10) add --ignore-requires-python.

.PHONY: install-dev test lint check-governance clean

# ── Install ──────────────────────────────────────────────────────────────────

install-dev:
	pip install -e ".[dev]" --break-system-packages

# ── Tests ────────────────────────────────────────────────────────────────────

test:
	pytest tests/ -v

test-store:
	pytest tests/unit/store/ -v

test-config:
	pytest tests/unit/config/ -v

test-cov:
	pytest tests/ -v --cov=globis_edge --cov-report=term-missing

# ── Lint / static checks ─────────────────────────────────────────────────────

lint:
	@echo "=== Checking for forbidden stdlib sqlite3 imports in src/ ==="
	@! grep -rn "import sqlite3" src/ || (echo "FAIL: forbidden sqlite3 imports found"; exit 1)
	@echo "PASS: no stdlib sqlite3 imports in src/"
	@echo "=== Checking for forbidden 0.0.0.0 binds in src/ ==="
	@! grep -rn "0\.0\.0\.0" src/ || (echo "FAIL: forbidden 0.0.0.0 bind found"; exit 1)
	@echo "PASS: no 0.0.0.0 binds in src/"

# ── Governance gate ───────────────────────────────────────────────────────────

check-governance:
	@echo "=== Validating governance files in governance/ ==="
	python -c "from globis_edge.config import _validate_governance; from pathlib import Path; _validate_governance(Path('governance')); print('PASS: governance files valid')"

# ── Benchmark ─────────────────────────────────────────────────────────────────

bench-mock:
	python eval/runners/run_latency.py --mock

bench:
	python eval/runners/run_latency.py

# ── Housekeeping ──────────────────────────────────────────────────────────────

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
	find . -name "*.pyc" -delete 2>/dev/null; true
	rm -rf .pytest_cache htmlcov .coverage

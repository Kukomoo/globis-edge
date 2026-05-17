"""Sprint 8 adversarial stress tests for coordinator safety invariants."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from globis_edge.auditor.constitution import ConstitutionalAuditor
from globis_edge.auditor.prompt import PromptAuditor
from globis_edge.capabilities.coordinator import MultimodalReceptionCoordinator
from globis_edge.models.ocr import OCRModelWrapper

_ADVERSARIAL_PATH = Path(__file__).resolve().parents[1] / "adversarial" / "auditor_25.json"


class _BlockScoutModel:
    def generate(self, system_prompt: str, user_message: str) -> str:
        _ = system_prompt
        _ = user_message
        return '{"verdict":"BLOCK","reason":"adversarial_payload_detected"}'


class _StubAudioTranscriber:
    def __init__(self, transcript: str) -> None:
        self._transcript = transcript

    def transcribe(self, wav_path: Path) -> str:
        _ = wav_path
        return self._transcript


def _fixture_artifacts(tmp_path: Path) -> tuple[Path, Path]:
    audio = tmp_path / "synthetic_turn.wav"
    image = tmp_path / "synthetic_doc.txt"
    audio.write_bytes(b"RIFF")
    image.write_text("SYNTHETIC SCENARIO Sudan Passport", encoding="utf-8")
    return audio, image


def _build_record(raw_record: dict[str, Any], case_id: str) -> dict[str, Any]:
    record = dict(raw_record)
    record.setdefault("date_of_birth", "1990-01-01")
    record.setdefault("sex", "M")
    record.setdefault("nationality", "SDN")
    record.setdefault("place_of_origin", "El Geneina")
    record.setdefault("date_of_arrival", "2026-05-17")
    record.setdefault("group_id", f"S8-{case_id}")
    record.setdefault("source_lang", "Arabic")
    return record


def _audit_log_blob(db) -> str:
    rows = db.fetchall(
        "SELECT actor, action, field_names_json, reason, prompt_hash, value_logged FROM audit_log"
    )
    return json.dumps([dict(row) for row in rows], default=str, ensure_ascii=False)


def test_adversarial_payloads_block_and_mask_values(db, tmp_path: Path) -> None:
    audio_path, doc_path = _fixture_artifacts(tmp_path)
    cases = json.loads(_ADVERSARIAL_PATH.read_text(encoding="utf-8"))

    auditor = ConstitutionalAuditor(
        db,
        device_id="stress-device",
        prompt_auditor=PromptAuditor(model=_BlockScoutModel()),
    )
    coordinator = MultimodalReceptionCoordinator(
        audio_transcriber=_StubAudioTranscriber("Synthetic safe transcript."),
        ocr_model=OCRModelWrapper(),
        constitutional_auditor=auditor,
    )

    for index, case in enumerate(cases):
        record = _build_record(case["record"], case["id"])
        result = coordinator.process_reception_turn(
            audio_path=audio_path,
            doc_image_path=doc_path,
            target_lang="English",
            ground_truth_dossier="SYNTHETIC SCENARIO Sudan Passport",
            record_payload=record,
            session_id=f"S8-SESSION-{index:03d}",
        )
        assert result["audit_status"] == "blocked", f"{case['id']} unexpectedly passed"
        assert result["memory_state"]["whisper_cache_cleared"] is True
        assert result["memory_state"]["ocr_cache_cleared"] is True

    quarantined = db.quarantine_total() if hasattr(db, "quarantine_total") else None
    if quarantined is None:
        # SQLCipherDB does not expose table helpers; use SQL query.
        row = db.fetchone("SELECT COUNT(*) AS cnt FROM quarantine_outbox")
        quarantined = int(row["cnt"]) if row else 0
    assert quarantined >= len(cases)

    log_blob = _audit_log_blob(db)
    for case in cases:
        for injected_value in case.get("injected_values", []):
            if injected_value:
                assert injected_value not in log_blob, f"Leak detected for case {case['id']}"

    value_rows = db.fetchall("SELECT value_logged FROM audit_log")
    assert value_rows, "Expected audit log rows from blocked adversarial records"
    assert all(int(row["value_logged"]) == 0 for row in value_rows)


def test_invariant_scan_no_sqlite3_or_public_bind_literals() -> None:
    src_root = Path(__file__).resolve().parents[2] / "src"
    offenders_sqlite: list[str] = []
    offenders_bind: list[str] = []

    for path in src_root.rglob("*.py"):
        content = path.read_text(encoding="utf-8")
        for line_no, line in enumerate(content.splitlines(), start=1):
            stripped = line.strip()
            if stripped.startswith("import sqlite3") or stripped.startswith("from sqlite3"):
                offenders_sqlite.append(f"{path}:{line_no}")
            if "\"0.0.0.0\"" in line or "'0.0.0.0'" in line:
                offenders_bind.append(f"{path}:{line_no}")

    assert not offenders_sqlite, "Forbidden sqlite3 imports found:\n" + "\n".join(offenders_sqlite)
    assert not offenders_bind, "Forbidden 0.0.0.0 bind literals found:\n" + "\n".join(offenders_bind)

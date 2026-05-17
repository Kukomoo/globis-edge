"""Integration tests for Sprint 7 multimodal orchestration."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest

from globis_edge.auditor.rules import AuditResult
from globis_edge.capabilities.coordinator import MultimodalReceptionCoordinator
from globis_edge.capabilities.dossier import DossierMismatchError
from globis_edge.capabilities.translation import TranslationResult


class StubAudioTranscriber:
    def __init__(self, text: str) -> None:
        self._text = text

    def transcribe(self, wav_path: Path) -> str:
        _ = wav_path
        return self._text


class StubOCRModel:
    def __init__(self, text: str) -> None:
        self._text = text
        self.unload_called = False

    def extract_text(self, image_path: Path) -> str:
        _ = image_path
        return self._text

    def unload(self) -> None:
        self.unload_called = True


class StubDossierReconstructor:
    def __init__(self, should_fail: bool = False) -> None:
        self._should_fail = should_fail

    def reconstruct_and_verify(self, ocr_text: str, ground_truth: str) -> dict[str, Any]:
        _ = ocr_text
        _ = ground_truth
        if self._should_fail:
            raise DossierMismatchError("Grounding mismatch: distance 7 exceeds threshold 5")
        return {"verified": True, "distance": 2}


class StubTranslator:
    def __init__(self, response: TranslationResult) -> None:
        self.response = response

    def translate(self, text: str, source_lang: str, target_lang: str) -> TranslationResult:
        _ = text
        _ = source_lang
        _ = target_lang
        return self.response


class StubAuditor:
    def __init__(self, blocked: bool = False) -> None:
        self.blocked = blocked
        self.called = False

    def audit(self, draft_record: dict[str, Any], session_id: str) -> AuditResult:
        _ = draft_record
        _ = session_id
        self.called = True
        if self.blocked:
            return AuditResult(
                violated=True,
                reason="Article 3 violation",
                violated_article="article_3",
                blocked_field_names=["political_affiliation"],
                requires_caseworker_review_chip=True,
                value_logged=False,
            )
        return AuditResult.clean()


@pytest.fixture
def fake_artifacts(tmp_path: Path) -> tuple[Path, Path]:
    audio = tmp_path / "arrival.wav"
    image = tmp_path / "passport.png"
    audio.write_bytes(b"RIFF")
    image.write_text("SYNTHETIC SCENARIO Sudan Passport", encoding="utf-8")
    return audio, image


def test_standard_safe_path_completes_and_clears_memory(fake_artifacts: tuple[Path, Path]) -> None:
    audio_path, image_path = fake_artifacts
    coordinator = MultimodalReceptionCoordinator(
        audio_transcriber=StubAudioTranscriber("هذه شهادة ميلاد سودانية للطفل."),
        translator=StubTranslator(
            TranslationResult(
                translated_text="This is a Sudanese birth certificate for the child.",
                source_lang="Arabic",
                target_lang="English",
                requires_human_triage=False,
                triage_reason=None,
            )
        ),
        ocr_model=StubOCRModel("Sudan Passport"),
        dossier_reconstructor=StubDossierReconstructor(should_fail=False),
        constitutional_auditor=StubAuditor(blocked=False),
    )

    result = coordinator.process_reception_turn(
        audio_path=audio_path,
        doc_image_path=image_path,
        target_lang="English",
        ground_truth_dossier="Sudan Passport",
        record_payload={
            "source_lang": "Arabic",
            "name": "Aisha Adam",
            "date_of_birth": "1991-03-15",
            "sex": "F",
            "nationality": "SDN",
            "place_of_origin": "El Geneina",
            "date_of_arrival": "2026-05-17",
            "group_id": "ADR-CHK-002",
        },
        session_id="SESSION-S7-001",
    )

    assert result["audit_status"] == "clean"
    assert result["requires_human_interpreter"] is False
    assert result["profile"]["dossier_verification"] == {"verified": True, "distance": 2}
    assert result["memory_state"]["whisper_cache_cleared"] is True
    assert result["memory_state"]["ocr_cache_cleared"] is True
    assert result["memory_state"]["whisper_cache_container_ready"] is True
    assert result["memory_state"]["ocr_cache"] is None


def test_dialect_triage_routing_flags_human_interpreter(
    fake_artifacts: tuple[Path, Path],
) -> None:
    audio_path, image_path = fake_artifacts
    coordinator = MultimodalReceptionCoordinator(
        audio_transcriber=StubAudioTranscriber("Triage transcript"),
        translator=StubTranslator(
            TranslationResult(
                translated_text="Triage transcript",
                source_lang="Zaghawa",
                target_lang="English",
                requires_human_triage=True,
                triage_reason="Professional human interpreter required for Zaghawa.",
            )
        ),
        ocr_model=StubOCRModel("Sudan Passport"),
        dossier_reconstructor=StubDossierReconstructor(should_fail=False),
        constitutional_auditor=StubAuditor(blocked=False),
    )

    result = coordinator.process_reception_turn(
        audio_path=audio_path,
        doc_image_path=image_path,
        target_lang="English",
        ground_truth_dossier="Sudan Passport",
        record_payload={
            "source_lang": "Zaghawa",
            "name": "Yusuf Hassan",
            "date_of_birth": "1988-04-02",
            "sex": "M",
            "nationality": "SDN",
            "place_of_origin": "Nyala",
            "date_of_arrival": "2026-05-17",
            "group_id": "ADR-CHK-003",
        },
        session_id="SESSION-S7-002",
    )

    assert result["requires_human_interpreter"] is True
    assert "interpreter" in (result["interpreter_reason"] or "").lower()
    assert result["memory_state"]["whisper_cache_cleared"] is True
    assert result["memory_state"]["ocr_cache_cleared"] is True
    assert result["memory_state"]["whisper_cache_container_ready"] is True
    assert result["memory_state"]["ocr_cache"] is None


def test_latency_sla_compliance_with_mocked_offsets(
    fake_artifacts: tuple[Path, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    audio_path, image_path = fake_artifacts
    coordinator = MultimodalReceptionCoordinator(
        audio_transcriber=StubAudioTranscriber("safe transcript"),
        translator=StubTranslator(
            TranslationResult(
                translated_text="safe translation",
                source_lang="Arabic",
                target_lang="English",
                requires_human_triage=False,
                triage_reason=None,
            )
        ),
        ocr_model=StubOCRModel("Sudan Passport"),
        dossier_reconstructor=StubDossierReconstructor(should_fail=False),
        constitutional_auditor=StubAuditor(blocked=False),
    )

    perf_points = iter([0.0, 1.2, 2.0, 5.7, 6.5, 10.9, 11.6, 14.2, 14.8, 14.8])
    monkeypatch.setattr(
        "globis_edge.capabilities.coordinator.time.perf_counter",
        lambda: next(perf_points),
    )

    result = coordinator.process_reception_turn(
        audio_path=audio_path,
        doc_image_path=image_path,
        target_lang="English",
        ground_truth_dossier="Sudan Passport",
        record_payload={
            "source_lang": "Arabic",
            "name": "Aisha Adam",
            "date_of_birth": "1991-03-15",
            "sex": "F",
            "nationality": "SDN",
            "place_of_origin": "El Geneina",
            "date_of_arrival": "2026-05-17",
            "group_id": "ADR-CHK-004",
        },
        session_id="SESSION-S7-003",
    )

    assert result["latency_seconds"]["total"] <= 15.0

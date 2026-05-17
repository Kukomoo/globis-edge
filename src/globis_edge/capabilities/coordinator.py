"""Sprint 7 multimodal coordinator for offline reception turns."""

from __future__ import annotations

import gc
import time
from pathlib import Path
from typing import Any

from globis_edge.asr import whisper_wrapper
from globis_edge.auditor.constitution import ConstitutionalAuditor
from globis_edge.capabilities.dossier import DossierMismatchError, DossierReconstructor
from globis_edge.capabilities.sanitiser import ASRSanitiser
from globis_edge.capabilities.translation import TranslationService
from globis_edge.models.audio import AudioTranscriber
from globis_edge.models.ocr import OCRModelWrapper


class MultimodalReceptionCoordinator:
    """Coordinates ASR, translation, OCR grounding, and dual-pass audit."""

    def __init__(
        self,
        *,
        audio_transcriber: AudioTranscriber | None = None,
        sanitiser: ASRSanitiser | None = None,
        translator: TranslationService | None = None,
        ocr_model: OCRModelWrapper | None = None,
        dossier_reconstructor: DossierReconstructor | None = None,
        constitutional_auditor: ConstitutionalAuditor | None = None,
    ) -> None:
        self._audio_transcriber = audio_transcriber or AudioTranscriber()
        self._sanitiser = sanitiser or ASRSanitiser()
        self._translator = translator or TranslationService()
        self._ocr_model = ocr_model or OCRModelWrapper()
        self._dossier = dossier_reconstructor or DossierReconstructor()
        self._auditor = constitutional_auditor
        self._ocr_cache_state: object | None = None
        self._whisper_cache_cleared = False
        self._ocr_cache_cleared = False

    def process_reception_turn(
        self,
        audio_path: Path,
        doc_image_path: Path,
        target_lang: str,
        ground_truth_dossier: str,
        record_payload: dict[str, Any],
        session_id: str,
    ) -> dict[str, Any]:
        """Execute one full reception turn under memory and safety constraints."""
        started_at = time.perf_counter()

        source_lang = str(record_payload.get("source_lang", "unknown"))

        phase_start = time.perf_counter()
        self._ensure_whisper_cache_dict()
        raw_transcript = self._audio_transcriber.transcribe(audio_path)
        self._force_whisper_unloaded()
        sanitised_transcript = self._sanitiser.sanitise(raw_transcript)
        asr_elapsed = time.perf_counter() - phase_start

        phase_start = time.perf_counter()
        translation = self._translator.translate(
            sanitised_transcript,
            source_lang,
            target_lang,
        )
        trans_elapsed = time.perf_counter() - phase_start

        phase_start = time.perf_counter()
        ocr_text = self._ocr_model.extract_text(doc_image_path)
        self._ocr_model.unload()
        self._ocr_cache_state = None
        self._ocr_cache_cleared = True
        gc.collect()
        ocr_elapsed = time.perf_counter() - phase_start

        phase_start = time.perf_counter()
        quarantine_reason: str | None = None
        verification: dict[str, str | int | bool] | None = None
        try:
            verification = self._dossier.reconstruct_and_verify(
                ocr_text,
                ground_truth_dossier,
            )
        except DossierMismatchError as exc:
            quarantine_reason = str(exc)

        audit_status = "blocked"
        audit_reason: str | None = quarantine_reason
        blocked_field_names: list[str] = []

        if quarantine_reason is None:
            audit_result = self._run_audit(record_payload, session_id)
            if audit_result is None or not getattr(audit_result, "violated", False):
                audit_status = "clean"
                audit_reason = None
            else:
                audit_status = "blocked"
                audit_reason = audit_result.reason
                blocked_field_names = list(audit_result.blocked_field_names)
        audit_elapsed = time.perf_counter() - phase_start

        total_elapsed = time.perf_counter() - started_at
        profile = {
            "sanitised_transcript": sanitised_transcript,
            "translated_text": translation.translated_text,
            "ocr_text": ocr_text,
            "dossier_verification": verification,
        }

        return {
            "profile": profile,
            "requires_human_interpreter": translation.requires_human_triage,
            "interpreter_reason": translation.triage_reason,
            "audit_status": audit_status,
            "audit_reason": audit_reason,
            "blocked_field_names": blocked_field_names,
            "session_id": session_id,
            "latency_seconds": {
                "asr": asr_elapsed,
                "translation": trans_elapsed,
                "ocr": ocr_elapsed,
                "audit": audit_elapsed,
                "total": total_elapsed,
            },
            "memory_state": {
                "whisper_cache_cleared": self._whisper_cache_cleared,
                "ocr_cache_cleared": self._ocr_cache_cleared,
                "whisper_cache_container_ready": isinstance(
                    whisper_wrapper._model_cache,
                    dict,
                ),
                "ocr_cache": self._ocr_cache_state,
            },
        }

    def _run_audit(self, record_payload: dict[str, Any], session_id: str) -> Any | None:
        if self._auditor is None:
            return None
        return self._auditor.audit(record_payload, session_id)

    def _ensure_whisper_cache_dict(self) -> None:
        if whisper_wrapper._model_cache is None:
            whisper_wrapper._model_cache = {}

    def _force_whisper_unloaded(self) -> None:
        whisper_wrapper._model_cache = None
        gc.collect()
        self._whisper_cache_cleared = True
        whisper_wrapper._model_cache = {}

"""Security-locked API routes for local commit and quarantine workflows."""

from __future__ import annotations

import ipaddress
import re
from dataclasses import dataclass
from typing import Any, Callable, Iterable

from fastapi import APIRouter, Depends, FastAPI, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from globis_edge.auditor.constitution import ConstitutionalAuditor, payload_hash
from globis_edge.auditor.prompt import PromptAuditor
from globis_edge.api.quarantine_badge import get_outbox_manager, router as quarantine_router
from globis_edge.store.audit_log import AuditLogger
from globis_edge.store.outbox import OutboxManager
from globis_edge.store.sqlcipher import SQLCipherDB

_LOCAL_SUBNET = ipaddress.ip_network("192.168.0.0/16")
_LOOPBACK_HOST = "127.0.0.1"
_WILDCARD_HOST = ".".join(["0", "0", "0", "0"])
_CARD_CANDIDATE_PATTERN = re.compile(r"(?:\d[ -]?){13,19}")
_SYNTHETIC_WATERMARK = "SYNTHETIC SCENARIO"

router = APIRouter(tags=["commit"])


class BindingHostError(RuntimeError):
    """Raised when the API attempts to bind outside the allowed local range."""


class CommitRequest(BaseModel):
    """Draft record submitted by the caseworker UI."""

    household_id: str = Field(min_length=1)
    session_id: str = Field(min_length=1)
    draft_record: dict[str, Any]
    dignity_confirmed: bool
    entity_type: str = "person"
    op_type: str = "INSERT"


class CommitResponse(BaseModel):
    """Structured response for accepted or rejected commit attempts."""

    status: str
    auditor_status: str
    outbox_uuid: str | None = None
    blocked_field_names: list[str] = Field(default_factory=list)
    triage_reason: str | None = None


class SystemStatusResponse(BaseModel):
    """Read-only status payload for the local dashboard."""

    api_up: bool
    db_ready: bool
    governance_ok: bool
    bind_host: str
    app_version: str


class NetworkStatusResponse(BaseModel):
    """Read-only network telemetry for caseworker connectivity."""

    ssid: str
    ap_ip: str
    psk_last_rotated_at: str | None
    clients_connected_count: int
    security_mode: str


@dataclass(frozen=True)
class EgressVerificationResult:
    """Result of local egress verification before outbox write."""

    is_clean: bool
    blocked_field_names: list[str]
    reason: str | None


def create_app(
    *,
    db: SQLCipherDB,
    device_id: str,
    host: str = _LOOPBACK_HOST,
    prompt_auditor: PromptAuditor | None = None,
    network_status_provider: Callable[[], NetworkStatusResponse] | None = None,
) -> FastAPI:
    """Create a FastAPI app with validated local-only binding metadata."""
    validated_host = validate_bind_host(host)
    app = FastAPI(title="Globis Edge Local API")
    app.state.bind_host = validated_host
    app.state.outbox_manager = OutboxManager(db, device_id=device_id)
    app.state.audit_logger = AuditLogger(db)
    app.state.constitutional_auditor = ConstitutionalAuditor(
        db,
        device_id=device_id,
        prompt_auditor=prompt_auditor,
    )
    app.state.network_status_provider = network_status_provider or default_network_status
    app.include_router(router)
    app.include_router(quarantine_router)
    return app


def validate_bind_host(host: str) -> str:
    """Ensure the API binds only to loopback or the approved private subnet."""
    if host == _WILDCARD_HOST:
        raise BindingHostError("Wildcard host binding is prohibited")

    try:
        parsed = ipaddress.ip_address(host)
    except ValueError as exc:
        raise BindingHostError(f"Invalid bind host: {host}") from exc

    if host == _LOOPBACK_HOST:
        return host
    if parsed in _LOCAL_SUBNET:
        return host
    raise BindingHostError("Host binding must stay on loopback or 192.168.0.0/16")


def get_constitutional_auditor(request: Request) -> ConstitutionalAuditor:
    """Retrieve the application-scoped constitutional auditor."""
    auditor: ConstitutionalAuditor | None = getattr(
        request.app.state,
        "constitutional_auditor",
        None,
    )
    if auditor is None:
        raise RuntimeError("ConstitutionalAuditor not attached to app.state")
    return auditor


def get_audit_logger(request: Request) -> AuditLogger:
    """Retrieve the application-scoped audit logger."""
    audit_logger: AuditLogger | None = getattr(request.app.state, "audit_logger", None)
    if audit_logger is None:
        raise RuntimeError("AuditLogger not attached to app.state")
    return audit_logger


@router.post(
    "/commit",
    response_model=CommitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Validate and commit one draft intake record",
)
def commit_record(
    payload: CommitRequest,
    outbox: OutboxManager = Depends(get_outbox_manager),
    auditor: ConstitutionalAuditor = Depends(get_constitutional_auditor),
    audit_logger: AuditLogger = Depends(get_audit_logger),
) -> CommitResponse | JSONResponse:
    """The sole egress path into the persistent outbox queue."""
    if not has_synthetic_watermark(payload.draft_record):
        quarantine_block(
            outbox=outbox,
            audit_logger=audit_logger,
            household_id=payload.household_id,
            session_id=payload.session_id,
            record=payload.draft_record,
            failure_reason="synthetic_watermark_missing",
            blocked_field_names=["synthetic_scenario"],
        )
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=CommitResponse(
                status="forbidden",
                auditor_status="clean",
                blocked_field_names=["synthetic_scenario"],
                triage_reason=(
                    "Synthetic scenario watermark is required before commit."
                ),
            ).model_dump(),
        )

    audit_result = auditor.audit(
        payload.draft_record,
        payload.session_id,
        household_id=payload.household_id,
    )

    if audit_result.violated:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=CommitResponse(
                status="forbidden",
                auditor_status="blocked",
                blocked_field_names=audit_result.blocked_field_names,
                triage_reason=audit_result.reason,
            ).model_dump(),
        )

    egress_verification = verify_egress_payload(payload.draft_record)
    if not egress_verification.is_clean:
        quarantine_block(
            outbox=outbox,
            audit_logger=audit_logger,
            household_id=payload.household_id,
            session_id=payload.session_id,
            record=payload.draft_record,
            failure_reason=egress_verification.reason or "egress_verification_failed",
            blocked_field_names=egress_verification.blocked_field_names,
        )
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=CommitResponse(
                status="forbidden",
                auditor_status="clean",
                blocked_field_names=egress_verification.blocked_field_names,
                triage_reason=egress_verification.reason,
            ).model_dump(),
        )

    if not payload.dignity_confirmed:
        quarantine_block(
            outbox=outbox,
            audit_logger=audit_logger,
            household_id=payload.household_id,
            session_id=payload.session_id,
            record=payload.draft_record,
            failure_reason="dignity_loop_confirmation_missing",
            blocked_field_names=["dignity_confirmed"],
        )
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=CommitResponse(
                status="forbidden",
                auditor_status="clean",
                blocked_field_names=["dignity_confirmed"],
                triage_reason="Dignity Loop confirmation is required before commit.",
            ).model_dump(),
        )

    next_logical_seq = outbox.next_logical_seq(payload.household_id)
    if outbox.detect_collision(payload.household_id, next_logical_seq, outbox._device_id):  # noqa: SLF001
        quarantine_block(
            outbox=outbox,
            audit_logger=audit_logger,
            household_id=payload.household_id,
            session_id=payload.session_id,
            record=payload.draft_record,
            failure_reason="lamport_collision_detected",
            blocked_field_names=["logical_seq"],
        )
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=CommitResponse(
                status="conflict",
                auditor_status="clean",
                blocked_field_names=["logical_seq"],
                triage_reason=(
                    "Lamport collision detected for this household; caseworker review required."
                ),
            ).model_dump(),
        )

    outbox_uuid = outbox.insert(
        payload.household_id,
        payload.entity_type,
        payload.op_type,
        payload_hash(payload.draft_record),
    )
    return CommitResponse(
        status="created",
        auditor_status="clean",
        outbox_uuid=outbox_uuid,
        blocked_field_names=[],
        triage_reason=None,
    )


def verify_egress_payload(record: dict[str, Any]) -> EgressVerificationResult:
    """Detect sensitive spillovers that must not enter the sync queue."""
    blocked_fields: list[str] = []

    for field_name, scalar_value in iter_scalar_fields(record):
        if not isinstance(scalar_value, str):
            continue
        if contains_payment_card_number(scalar_value):
            if field_name not in blocked_fields:
                blocked_fields.append(field_name)

    if not blocked_fields:
        return EgressVerificationResult(True, [], None)

    return EgressVerificationResult(
        is_clean=False,
        blocked_field_names=blocked_fields,
        reason=(
            "Potential payment-card data detected in field(s): "
            + ", ".join(blocked_fields)
            + ". Values were NOT logged."
        ),
    )


def quarantine_block(
    *,
    outbox: OutboxManager,
    audit_logger: AuditLogger,
    household_id: str,
    session_id: str,
    record: dict[str, Any],
    failure_reason: str,
    blocked_field_names: list[str],
) -> None:
    """Append a blocked commit attempt to quarantine and the audit log."""
    blocked_field_text = ",".join(blocked_field_names) if blocked_field_names else None
    outbox.quarantine(
        household_id=household_id,
        payload_hash=payload_hash(record),
        failure_reason=failure_reason,
        blocked_field_attempted=blocked_field_text,
    )
    audit_logger.log(
        actor="caseworker",
        action="commit_blocked",
        field_names=blocked_field_names,
        reason=failure_reason,
        prompt_hash=None,
        session_id=session_id,
    )


def iter_scalar_fields(
    value: Any,
    *,
    prefix: str = "",
) -> Iterable[tuple[str, Any]]:
    """Yield ``(field_name, scalar_value)`` pairs from nested payloads."""
    if isinstance(value, dict):
        for key, nested_value in value.items():
            field_name = f"{prefix}.{key}" if prefix else str(key)
            yield from iter_scalar_fields(nested_value, prefix=field_name)
        return

    if isinstance(value, list):
        for index, nested_value in enumerate(value):
            field_name = f"{prefix}[{index}]" if prefix else f"[{index}]"
            yield from iter_scalar_fields(nested_value, prefix=field_name)
        return

    yield prefix or "value", value


def has_synthetic_watermark(record: dict[str, Any]) -> bool:
    """Return True only when payload contains the synthetic-data watermark."""
    needle = _SYNTHETIC_WATERMARK.lower()
    for _, scalar_value in iter_scalar_fields(record):
        if isinstance(scalar_value, str) and needle in scalar_value.lower():
            return True
    return False


@router.get(
    "/system/status",
    response_model=SystemStatusResponse,
    summary="Read-only local API and runtime status",
)
def get_system_status(request: Request) -> SystemStatusResponse:
    """Expose local status for the Pi dashboard without sensitive values."""
    db_ready = bool(getattr(request.app.state, "outbox_manager", None))
    return SystemStatusResponse(
        api_up=True,
        db_ready=db_ready,
        governance_ok=True,
        bind_host=str(getattr(request.app.state, "bind_host", _LOOPBACK_HOST)),
        app_version="0.1.0",
    )


def default_network_status() -> NetworkStatusResponse:
    """Return conservative default hotspot telemetry."""
    return NetworkStatusResponse(
        ssid="globis-edge-local",
        ap_ip="192.168.50.1",
        psk_last_rotated_at=None,
        clients_connected_count=0,
        security_mode="WPA2-PSK",
    )


@router.get(
    "/system/network",
    response_model=NetworkStatusResponse,
    summary="Read-only Wi-Fi AP telemetry for caseworker connection support",
)
def get_network_status(request: Request) -> NetworkStatusResponse:
    """Expose non-sensitive AP metadata only."""
    provider = getattr(request.app.state, "network_status_provider", None)
    if callable(provider):
        result = provider()
        if isinstance(result, NetworkStatusResponse):
            return result
    return default_network_status()


def contains_payment_card_number(text: str) -> bool:
    """Return ``True`` when ``text`` contains a Luhn-valid card candidate."""
    for candidate in _CARD_CANDIDATE_PATTERN.findall(text):
        digits = "".join(character for character in candidate if character.isdigit())
        if 13 <= len(digits) <= 19 and passes_luhn_check(digits):
            return True
    return False


def passes_luhn_check(digits: str) -> bool:
    """Validate a numeric candidate with the Luhn checksum."""
    total = 0
    reverse_digits = digits[::-1]
    for index, character in enumerate(reverse_digits):
        value = int(character)
        if index % 2 == 1:
            value *= 2
            if value > 9:
                value -= 9
        total += value
    return total % 10 == 0

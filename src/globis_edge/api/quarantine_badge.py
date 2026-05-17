"""
quarantine_badge.py — FastAPI router for the quarantine badge endpoints.

Background
----------
The quarantine outbox accumulates records that failed schema validation
during sync. Without visibility into this table, failed records pile up
silently — a risk identified in the Logic Lock audit as finding FP2
("quarantine accumulation risk").

This router exposes three endpoints to the caseworker UI:

``GET /quarantine/count``
    Lightweight poll (every 30 s) that drives the red badge counter.
    ``unreviewed_count > 0`` signals that caseworker attention is required.

``GET /quarantine/summary``
    Full list of unreviewed quarantine records. Field values are explicitly
    excluded — only field *names* and metadata are returned.

``POST /quarantine/{uuid}/review-complete``
    Caseworker marks a record as manually reviewed. The record is retained
    in the append-only quarantine table; only ``reviewed_at_iso`` is set.

All three endpoints read from / write to :class:`OutboxManager`, which is
injected via FastAPI's ``Depends`` mechanism from the application state set
up in ``server.py``.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from ..store.outbox import OutboxManager

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/quarantine", tags=["quarantine"])


# ---------------------------------------------------------------------------
# Pydantic v2 response models
# ---------------------------------------------------------------------------


class QuarantineCount(BaseModel):
    """Payload returned by ``GET /quarantine/count``.

    Attributes:
        total_count: Total number of rows in ``quarantine_outbox``,
            including reviewed records. Useful for trend monitoring.
        unreviewed_count: Number of records where ``reviewed_at_iso IS NULL``.
            This value drives the red badge indicator in the caseworker UI.
            A non-zero value means schema-validation failures are pending
            caseworker review.
        oldest_quarantine_iso: ISO-8601 timestamp of the oldest unreviewed
            record, or ``None`` when the unreviewed queue is empty. Helps
            the UI flag stale items.
    """

    total_count: int = Field(ge=0)
    unreviewed_count: int = Field(ge=0)
    oldest_quarantine_iso: str | None = None


class QuarantineRecord(BaseModel):
    """A single quarantine record as returned by ``GET /quarantine/summary``.

    Payload values are explicitly excluded. ``blocked_field_attempted``
    contains the field *name* that triggered the block (e.g.
    ``"political_affiliation"``), never the submitted value.

    Attributes:
        uuid: Primary key of the quarantine row.
        household_id: Household the failed record concerns.
        failure_reason: Human-readable description of why the record was
            quarantined (e.g. ``"schema_validation_error"``).
        blocked_field_attempted: Name of the field that triggered the
            constitutional block, or ``None`` for non-field-specific
            failures.
        quarantine_at_iso: ISO-8601 timestamp when the record entered
            quarantine.
        attempts: Number of sync attempts made before quarantine.
        reviewed_at_iso: ISO-8601 timestamp when a caseworker marked the
            record reviewed, or ``None`` if still pending.
    """

    uuid: str
    household_id: str
    failure_reason: str
    blocked_field_attempted: str | None = None
    flagged_field_names: list[str] = Field(default_factory=list)
    quarantine_at_iso: str
    attempts: int = Field(ge=0)
    reviewed_at_iso: str | None = None


class QuarantineSummary(BaseModel):
    """Payload returned by ``GET /quarantine/summary``.

    Attributes:
        records: List of unreviewed quarantine records. Payload values are
            never included in any record.
    """

    records: list[QuarantineRecord]


# ---------------------------------------------------------------------------
# Dependency: OutboxManager from app state
# ---------------------------------------------------------------------------


def get_outbox_manager(request: Request) -> OutboxManager:
    """FastAPI dependency that retrieves the :class:`OutboxManager` from app state.

    The ``OutboxManager`` instance is expected to be stored on the FastAPI
    application's ``state`` object during startup in ``server.py``::

        @app.on_event("startup")
        async def startup() -> None:
            app.state.outbox_manager = OutboxManager(
                db_path=settings.db_path,
                device_id=settings.device_id,
                db_key=settings.db_key,
            )

    Args:
        request: The incoming FastAPI request; provides access to
            ``request.app.state``.

    Returns:
        The application-scoped :class:`OutboxManager` instance.

    Raises:
        :class:`RuntimeError`: If ``outbox_manager`` has not been attached
            to ``app.state`` during startup.
    """
    outbox_manager: OutboxManager | None = getattr(
        request.app.state, "outbox_manager", None
    )
    if outbox_manager is None:
        raise RuntimeError(
            "OutboxManager not found in app.state. "
            "Ensure server startup attaches app.state.outbox_manager."
        )
    return outbox_manager


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get(
    "/count",
    response_model=QuarantineCount,
    summary="Quarantine badge counter",
)
def get_quarantine_count(
    outbox: OutboxManager = Depends(get_outbox_manager),
) -> QuarantineCount:
    """Powers the quarantine counter badge in the caseworker UI.

    ``unreviewed_count`` drives the red badge indicator. A non-zero value
    means schema-validation failures are pending caseworker review. Without
    this endpoint, failed records accumulate silently (Logic Lock finding:
    quarantine accumulation risk, FP2).

    Intended poll interval from the UI: every 30 seconds.

    Returns:
        A :class:`QuarantineCount` with ``total_count``,
        ``unreviewed_count``, and ``oldest_quarantine_iso``.
    """
    unreviewed_count = outbox.quarantine_count()

    # Retrieve total count and oldest unreviewed timestamp in one query
    # by inspecting the summary; this avoids adding new OutboxManager methods.
    summary_rows = outbox.quarantine_summary()  # only unreviewed rows

    oldest_iso: str | None = None
    if summary_rows:
        # quarantine_summary returns rows ordered ASC by quarantine_at_iso.
        oldest_iso = summary_rows[0].get("quarantine_at_iso")

    total_count = outbox.quarantine_total()

    return QuarantineCount(
        total_count=total_count,
        unreviewed_count=unreviewed_count,
        oldest_quarantine_iso=oldest_iso,
    )


@router.get(
    "/summary",
    response_model=QuarantineSummary,
    summary="List unreviewed quarantine records",
)
def get_quarantine_summary(
    outbox: OutboxManager = Depends(get_outbox_manager),
) -> QuarantineSummary:
    """Return all unreviewed quarantine records for caseworker triage.

    Payload values are explicitly excluded from every record. The
    ``blocked_field_attempted`` field contains a field *name* only
    (e.g. ``"political_affiliation"``), never the value that was submitted.

    Returns:
        A :class:`QuarantineSummary` containing a list of
        :class:`QuarantineRecord` instances, ordered oldest-first.
    """
    rows = outbox.quarantine_summary()
    records = [
        QuarantineRecord(
            **row,
            flagged_field_names=_expand_flagged_field_names(
                row.get("blocked_field_attempted")
            ),
        )
        for row in rows
    ]
    return QuarantineSummary(records=records)


@router.post(
    "/{uuid}/review-complete",
    summary="Mark a quarantine record as manually reviewed",
)
def mark_review_complete(
    uuid: str,
    outbox: OutboxManager = Depends(get_outbox_manager),
) -> dict[str, str]:
    """Caseworker marks a quarantine record as manually reviewed.

    The record is retained in ``quarantine_outbox`` as an append-only
    audit trail; only ``reviewed_at_iso`` is updated. Subsequent calls
    to ``GET /quarantine/count`` and ``GET /quarantine/summary`` will
    exclude this record from the unreviewed queue.

    Args:
        uuid: The UUID of the quarantine record to mark reviewed.

    Returns:
        A dict with ``status="ok"`` and ``reviewed_at_iso`` set to the
        UTC timestamp at which the review was recorded.

    Raises:
        ``404 Not Found`` if no quarantine record with the given UUID exists.
    """
    try:
        outbox.mark_quarantine_reviewed(uuid)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    reviewed_at_iso = (
        datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    )
    return {"status": "ok", "reviewed_at_iso": reviewed_at_iso}


def _expand_flagged_field_names(blocked_field_attempted: str | None) -> list[str]:
    """Expand stored blocked-field metadata into a UI-friendly list."""
    if not blocked_field_attempted:
        return []
    return [
        field_name.strip()
        for field_name in blocked_field_attempted.split(",")
        if field_name.strip()
    ]

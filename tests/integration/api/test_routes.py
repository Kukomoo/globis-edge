"""Integration coverage for the local API commit and quarantine flows."""

from __future__ import annotations

import json

from fastapi.responses import JSONResponse

from globis_edge.api.quarantine_badge import get_quarantine_count, get_quarantine_summary
from globis_edge.api.routes import (
    BindingHostError,
    CommitRequest,
    CommitResponse,
    commit_record,
    create_app,
)
from globis_edge.auditor.prompt import PromptAuditor
from globis_edge.store.sqlcipher import SQLCipherDB


class PassScoutModel:
    """Deterministic prompt-pass model for integration tests."""

    def generate(self, system_prompt: str, user_message: str) -> str:
        _ = system_prompt
        _ = user_message
        return '{"verdict":"PASS","reason":"ok"}'


def clean_reception_record() -> dict[str, str]:
    """Synthetic IER-style record for a newly arrived Sudanese family."""
    return {
        "name": "Aisha Adam",
        "date_of_birth": "1991-03-15",
        "sex": "F",
        "nationality": "SDN",
        "place_of_origin": "El Geneina",
        "date_of_arrival": "2026-05-17",
        "group_id": "ADR-CHK-001",
        "notes": "Sudanese passport presented at the eastern border checkpoint.",
    }


def make_app(db: SQLCipherDB):
    """Create an app with a deterministic Prompt Pass for integration tests."""
    return create_app(
        db=db,
        device_id="api-test-device",
        host="127.0.0.1",
        prompt_auditor=PromptAuditor(model=PassScoutModel()),
    )


def decode_response(response: CommitResponse | JSONResponse) -> dict[str, object]:
    """Decode either a pydantic response model or a JSONResponse."""
    if isinstance(response, JSONResponse):
        return json.loads(response.body.decode("utf-8"))
    return response.model_dump()
    return TestClient(app)


def test_secure_binding_rejects_wildcard_host(db: SQLCipherDB) -> None:
    try:
        create_app(
            db=db,
            device_id="api-test-device",
            host=".".join(["0", "0", "0", "0"]),
            prompt_auditor=PromptAuditor(model=PassScoutModel()),
        )
    except BindingHostError as exc:
        assert "Wildcard host binding is prohibited" in str(exc)
    else:
        raise AssertionError("Expected BindingHostError for wildcard host")


def test_clean_and_consented_commit_writes_outbox(db: SQLCipherDB) -> None:
    app = make_app(db)

    response = commit_record(
        CommitRequest(
            household_id="HH-ADR-001",
            session_id="SESSION-ADR-001",
            draft_record=clean_reception_record(),
            dignity_confirmed=True,
        ),
        outbox=app.state.outbox_manager,
        auditor=app.state.constitutional_auditor,
        audit_logger=app.state.audit_logger,
    )

    body = decode_response(response)
    assert body["status"] == "created"
    assert body["auditor_status"] == "clean"
    assert body["outbox_uuid"]

    rows = db.fetchall("SELECT household_id, entity_type, op_type FROM outbox")
    assert len(rows) == 1
    assert rows[0]["household_id"] == "HH-ADR-001"
    assert rows[0]["entity_type"] == "person"
    assert rows[0]["op_type"] == "INSERT"


def test_blocked_commit_with_credit_card_spillover_is_quarantined(
    db: SQLCipherDB,
) -> None:
    app = make_app(db)
    compromised_record = clean_reception_record()
    compromised_record["notes"] = (
        "Border clerk copied payment reference 4111 1111 1111 1111 into notes."
    )

    response = commit_record(
        CommitRequest(
            household_id="HH-ADR-002",
            session_id="SESSION-ADR-002",
            draft_record=compromised_record,
            dignity_confirmed=True,
        ),
        outbox=app.state.outbox_manager,
        auditor=app.state.constitutional_auditor,
        audit_logger=app.state.audit_logger,
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 403
    body = decode_response(response)
    assert body["status"] == "forbidden"
    assert body["auditor_status"] == "clean"
    assert body["blocked_field_names"] == ["notes"]
    assert "4111 1111 1111 1111" not in response.body.decode("utf-8")

    assert db.fetchall("SELECT * FROM outbox") == []


def test_quarantine_badge_and_summary_hide_sensitive_values(db: SQLCipherDB) -> None:
    app = make_app(db)
    compromised_record = clean_reception_record()
    compromised_record["notes"] = (
        "Family arrival log includes card number 4111-1111-1111-1111 from a copied slip."
    )

    blocked = commit_record(
        CommitRequest(
            household_id="HH-ADR-003",
            session_id="SESSION-ADR-003",
            draft_record=compromised_record,
            dignity_confirmed=True,
        ),
        outbox=app.state.outbox_manager,
        auditor=app.state.constitutional_auditor,
        audit_logger=app.state.audit_logger,
    )
    assert isinstance(blocked, JSONResponse)
    assert blocked.status_code == 403

    count_response = get_quarantine_count(app.state.outbox_manager)
    assert count_response.unreviewed_count == 1

    summary_response = get_quarantine_summary(app.state.outbox_manager)
    assert len(summary_response.records) == 1
    record = summary_response.records[0]
    assert record.household_id == "HH-ADR-003"
    assert record.blocked_field_attempted == "notes"
    assert record.flagged_field_names == ["notes"]
    assert "4111-1111-1111-1111" not in summary_response.model_dump_json()
    assert "Potential payment-card data detected in field(s): notes." in record.failure_reason

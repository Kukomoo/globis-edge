-- schema.sql — Globis Edge canonical DDL
--
-- This file is the single source of truth for the encrypted database schema.
-- All other modules (outbox.py, audit_log.py, dossier.py, etc.) reference
-- these definitions rather than declaring their own DDL.
--
-- Invariants enforced at the schema layer
-- ---------------------------------------
-- 1. audit_log has NO `value` column. Field VALUES cannot be written here
--    regardless of caller intent. The CHECK on `value_logged` guarantees the
--    contract is machine-readable: any row claiming a value was logged is
--    rejected by SQLCipher itself.
--
-- 2. outbox uses a COMPOUND UNIQUE key (household_id, logical_seq, device_id).
--    This permits two offline devices to independently hold logical_seq=1 for
--    the same household (legitimate divergence), while preventing a single
--    device from duplicating its own counter. Collision detection (outbox.py)
--    interprets cross-device matches as conflicts requiring resolution.
--
-- 3. quarantine_outbox is append-only by convention. Only `reviewed_at_iso`
--    is ever updated; no DELETE statement targets this table in the codebase.

------------------------------------------------------------------------------
-- persons + claims + evidence + artifacts
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS persons (
    person_id           TEXT PRIMARY KEY,
    household_id        TEXT NOT NULL,
    created_at_iso      TEXT NOT NULL,
    session_id          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS claims (
    claim_id            TEXT PRIMARY KEY,
    person_id           TEXT NOT NULL REFERENCES persons(person_id),
    attribute           TEXT NOT NULL,
    value               TEXT NOT NULL,
    confidence          REAL NOT NULL,
    confidence_band     TEXT NOT NULL CHECK (confidence_band IN ('HIGH','MEDIUM','LOW')),
    extractor           TEXT NOT NULL,
    prompt_hash         TEXT NOT NULL,
    created_at_iso      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence (
    evidence_id         TEXT PRIMARY KEY,
    claim_id            TEXT NOT NULL REFERENCES claims(claim_id),
    artifact_id         TEXT NOT NULL,
    quote               TEXT NOT NULL,
    bbox_or_span        TEXT,
    created_at_iso      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artifacts (
    artifact_id         TEXT PRIMARY KEY,
    person_id           TEXT REFERENCES persons(person_id),
    media_type          TEXT NOT NULL,
    file_path           TEXT NOT NULL,
    ocr_text            TEXT,
    watermark_verified  INTEGER NOT NULL DEFAULT 0,
    created_at_iso      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS specific_needs (
    need_id             TEXT PRIMARY KEY,
    person_id           TEXT NOT NULL REFERENCES persons(person_id),
    tag                 TEXT NOT NULL,
    referral_to         TEXT,
    created_at_iso      TEXT NOT NULL
);

------------------------------------------------------------------------------
-- audit_log — append-only, field NAMES only, never values
--
-- The CHECK on `value_logged` is the schema-level guard: any row claiming a
-- value was logged is rejected by SQLCipher. Combined with AuditLogger's
-- method signature (which has no `value` parameter), this makes value
-- logging structurally impossible.
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_log (
    log_id              TEXT PRIMARY KEY,
    timestamp_iso       TEXT NOT NULL,
    session_id          TEXT NOT NULL,
    actor               TEXT NOT NULL
                        CHECK (actor IN ('auditor','scout','analyst','caseworker','system')),
    action              TEXT NOT NULL,
    field_names_json    TEXT NOT NULL,
    reason              TEXT,
    prompt_hash         TEXT,
    value_logged        INTEGER NOT NULL DEFAULT 0
                        CHECK (value_logged = 0)
);

CREATE TABLE IF NOT EXISTS explainers (
    explainer_id        TEXT PRIMARY KEY,
    person_id           TEXT NOT NULL REFERENCES persons(person_id),
    source_document     TEXT NOT NULL,
    stage_a_faithful    TEXT NOT NULL,
    stage_b_plain       TEXT NOT NULL,
    target_language     TEXT NOT NULL,
    created_at_iso      TEXT NOT NULL
);

------------------------------------------------------------------------------
-- outbox — Lamport-clock with compound key
--
-- UNIQUE (household_id, logical_seq, device_id) is the deepest defence of the
-- Logic Lock race condition fix. The constraint permits cross-device
-- divergence (each device's own counter) while preventing same-device
-- duplicates.
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS outbox (
    uuid                TEXT PRIMARY KEY,
    household_id        TEXT NOT NULL,
    entity_type         TEXT NOT NULL,
    op_type             TEXT NOT NULL
                        CHECK (op_type IN ('INSERT','UPDATE','DELETE')),
    payload_hash        TEXT NOT NULL,
    logical_seq         INTEGER NOT NULL,
    device_id           TEXT NOT NULL,
    created_at_iso      TEXT NOT NULL,
    sync_status         TEXT NOT NULL DEFAULT 'PENDING_SYNC'
                        CHECK (sync_status IN ('PENDING_SYNC','SYNCED','CONFLICTED')),
    attempts            INTEGER NOT NULL DEFAULT 0,
    UNIQUE (household_id, logical_seq, device_id)
);

------------------------------------------------------------------------------
-- quarantine_outbox — append-only triage queue
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS quarantine_outbox (
    uuid                        TEXT PRIMARY KEY,
    household_id                TEXT NOT NULL,
    payload_hash                TEXT NOT NULL,
    logical_seq                 INTEGER NOT NULL DEFAULT 0,
    device_id                   TEXT NOT NULL DEFAULT '',
    quarantine_at_iso           TEXT NOT NULL,
    failure_reason              TEXT NOT NULL,
    blocked_field_attempted     TEXT,
    attempts                    INTEGER NOT NULL DEFAULT 0,
    reviewed_at_iso             TEXT
);

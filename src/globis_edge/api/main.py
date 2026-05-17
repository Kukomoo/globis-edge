from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib

app = FastAPI(title="Globis Edge Scout-on-Pi Demo")

ROOT = Path(__file__).resolve().parents[3]
SYNTHETIC_DIR = ROOT / "synthetic_cases"

PROHIBITED_FIELDS = {
    "political_affiliation",
    "religion",
    "sexual_orientation",
    "ethnicity",
}

SCORE_FIELDS = {
    "eligibility_score",
    "credibility_score",
    "fraud_risk",
    "status_prediction",
}


def stable_hash(payload):
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True).encode("utf-8")
    ).hexdigest()[:16]


def load_case(name: str):
    path = SYNTHETIC_DIR / name / "case.json"
    return json.loads(path.read_text(encoding="utf-8"))


def require_synthetic(case):
    return case.get("watermark") == "SYNTHETIC SCENARIO"


def rule_audit(case):
    joined = json.dumps(case, ensure_ascii=False).lower()
    blocked = []

    for field in PROHIBITED_FIELDS | SCORE_FIELDS:
        if field in joined:
            blocked.append(field)

    return {
        "audit_passed": len(blocked) == 0,
        "blocked_field_names": blocked,
        "value_logged": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "requires_caseworker_review_chip": len(blocked) > 0,
    }


def run_aisha_pipeline():
    case = load_case("aisha")
    audit = rule_audit(case)

    record = {
        "case_summary": (
            "Synthetic intake record for Hawa Adam and dependent Musa Adam. "
            "Documents and testimony agree on names but conflict on the dependent birth year."
        ),
        "people": [
            {
                "name": "Hawa Adam",
                "role": "adult",
                "evidence": [
                    "aisha-audio-001: My name is Hawa Adam",
                    "aisha-token-001: Adult: Hawa Adam",
                ],
            },
            {
                "name": "Musa Adam",
                "role": "dependent",
                "evidence": [
                    "aisha-audio-001: My child is Musa Adam",
                    "aisha-passport-001: Child: Musa Adam",
                ],
            },
        ],
        "conflicts": [
            {
                "field": "dependent_birth_year",
                "observed_values": ["2016?", "2017"],
                "evidence": [
                    "aisha-passport-001: Year of birth: 2016?",
                    "aisha-token-001: DOB: 2017",
                ],
                "recommended_action": "human_review",
            }
        ],
        "plain_language_explanation": (
            "We prepared a draft record from the information you gave and the documents shown. "
            "The names appear consistent, but the child's year of birth appears different across two papers. "
            "A caseworker should review this with you before the record is saved."
        ),
        "commit_allowed": False,
        "requires_human_review": True,
    }

    commit = {
        "commit_status": "blocked",
        "reason": "Human review required before commit/export.",
        "quarantine_id": stable_hash({"record": record, "audit": audit}),
        "value_logged": False,
    }

    return {
        "mode": "demo_pipeline",
        "case_name": "aisha",
        "synthetic_only": require_synthetic(case),
        "case": case,
        "record": record,
        "audit": audit,
        "commit": commit,
        "quarantine": {
            "total_count": 1,
            "unreviewed_count": 1,
            "oldest_quarantine_iso": audit["timestamp"],
        },
    }


def run_yusuf_pipeline():
    case = load_case("yusuf")
    audit = rule_audit(case)

    commit = {
        "commit_status": "blocked",
        "reason": "Sensitive field category blocked before model processing.",
        "quarantine_id": stable_hash({"case": case, "audit": audit}),
        "value_logged": False,
    }

    return {
        "mode": "demo_pipeline",
        "case_name": "yusuf",
        "synthetic_only": require_synthetic(case),
        "case": case,
        "record": None,
        "audit": audit,
        "commit": commit,
        "quarantine": {
            "total_count": 1,
            "unreviewed_count": 1 if audit["blocked_field_names"] else 0,
            "oldest_quarantine_iso": audit["timestamp"],
        },
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "node": "pi5-analyst",
        "mode": "scout-on-pi",
    }


@app.get("/demo/aisha")
def demo_aisha():
    return run_aisha_pipeline()


@app.get("/demo/yusuf")
def demo_yusuf():
    return run_yusuf_pipeline()


@app.get("/quarantine/count")
def quarantine_count():
    result = run_yusuf_pipeline()
    return result["quarantine"]


@app.get("/", response_class=HTMLResponse)
def ui():
    aisha = run_aisha_pipeline()
    yusuf = run_yusuf_pipeline()
    conflict = aisha["record"]["conflicts"][0]

    html = f"""
    <html>
    <head>
      <title>Globis Edge</title>
      <style>
        body {{
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f6f3ee;
          color: #171717;
          margin: 0;
          padding: 32px;
        }}
        .shell {{ max-width: 1150px; margin: auto; }}
        .top {{
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }}
        .badge {{
          background: #8b1e1e;
          color: white;
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 800;
        }}
        .grid {{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }}
        .card {{
          background: white;
          border: 1px solid #ded6cb;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
        }}
        .chip {{
          display: inline-block;
          background: #fff1c2;
          border: 1px solid #e5b800;
          padding: 10px 14px;
          border-radius: 999px;
          font-weight: 800;
          margin: 4px 4px 4px 0;
        }}
        .safe {{
          background: #e5f7e8;
          border-color: #67aa72;
        }}
        .blocked {{
          background: #ffe1e1;
          border-color: #cc4444;
        }}
        pre {{
          white-space: pre-wrap;
          font-size: 13px;
          max-height: 280px;
          overflow: auto;
          background: #f8f8f8;
          padding: 12px;
          border-radius: 12px;
        }}
        .footer {{
          margin-top: 22px;
          font-size: 13px;
          color: #555;
        }}
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="top">
          <div>
            <h1>Globis Edge 2.0</h1>
            <p>Humanitarian intake, offline by design. Running in Scout-on-Pi mode.</p>
          </div>
          <div class="badge">Quarantine: {yusuf["quarantine"]["unreviewed_count"]}</div>
        </div>

        <div class="grid">
          <div class="card">
            <h2>1. Field Kit Status</h2>
            <p class="chip safe">Pi 5 Analyst: online</p>
            <p class="chip safe">Synthetic-only: {aisha["synthetic_only"]}</p>
            <p class="chip safe">Value logged: {aisha["audit"]["value_logged"]}</p>
          </div>

          <div class="card">
            <h2>2. Intake Artifacts</h2>
            <pre>{json.dumps(aisha["case"]["artifacts"], indent=2)}</pre>
          </div>

          <div class="card">
            <h2>3. Cross-Modal Conflict Resolver</h2>
            <p class="chip">⚠ Conflict: {conflict["field"]}</p>
            <p><strong>Observed values:</strong> {", ".join(conflict["observed_values"])}</p>
            <p><strong>Action:</strong> {conflict["recommended_action"]}</p>
          </div>

          <div class="card">
            <h2>4. Constitutional Auditor</h2>
            <p class="chip blocked">Blocked field names: {yusuf["audit"]["blocked_field_names"]}</p>
            <p>Value logged: {yusuf["audit"]["value_logged"]}</p>
            <p>A sensitive field category was blocked from this record.</p>
          </div>

          <div class="card">
            <h2>5. Dignity Loop</h2>
            <p>{aisha["record"]["plain_language_explanation"]}</p>
          </div>

          <div class="card">
            <h2>6. Commit Gate</h2>
            <p class="chip blocked">Commit status: {aisha["commit"]["commit_status"]}</p>
            <p>{aisha["commit"]["reason"]}</p>
            <p>Quarantine ID: {aisha["commit"]["quarantine_id"]}</p>
          </div>
        </div>

        <div class="footer">
          Globis Edge does not score credibility, predict asylum outcomes, authenticate documents,
          perform biometric matching, replace interpreters, or conduct substantive asylum interviews.
        </div>
      </div>
    </body>
    </html>
    """
    return HTMLResponse(html)


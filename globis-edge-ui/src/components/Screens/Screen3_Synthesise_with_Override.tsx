import { useState, useEffect } from "react";
import { useSession } from "../../store/SessionContext";
import { synthesise } from "../../services/api";
import { ProvenancePin } from "../UI/ProvenancePin";
import { AuditorPanel } from "../UI/AuditorPanel";
import { OverrideButton } from "../UI/OverrideButton";

export function Screen3_Synthesise_with_Override() {
  const { state, dispatch } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuditorDetails, setShowAuditorDetails] = useState(false);

  useEffect(() => {
    if (!state.dossier && state.id) {
      handleSynthesise();
    }
  }, []);

  const handleSynthesise = async () => {
    if (!state.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await synthesise(state.id);
      dispatch({ type: "SET_DOSSIER", payload: response.data });
    } catch (err: any) {
      setError(err.message || "Failed to synthesise dossier");
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideCommit = (signature: string) => {
    if (!state.dossier) return;
    const decision = {
      timestamp: new Date().toISOString(),
      caseworker: signature,
      session_id: state.id,
      blocked_fields: state.dossier.blocked_fields || [],
      blocked_field_count: (state.dossier.blocked_fields || []).length,
      action: "COMMIT_WITH_AWARENESS",
    };
    console.log("Override Decision Logged:", decision);
    dispatch({
      type: "SET_DOSSIER",
      payload: {
        ...state.dossier,
        override_decision: decision,
        case_readiness: {
          ...state.dossier.case_readiness,
          eligible_for_export: true,
        },
      },
    });
    dispatch({ type: "SET_SCREEN", payload: 4 });
  };

  const dossier = state.dossier;
  const isClean = dossier?.auditor_status === "clean";
  const isBlocked = dossier?.auditor_status === "blocked";

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🧩</span>
          <h1 className="text-3xl font-bold text-gray-900">Synthesised Dossier</h1>
        </div>
        <p className="text-gray-500 ml-11">
          Unified view across all modalities · Constitutional Audit complete
        </p>
      </div>

      {/* ── Loading ─────────────────────────────────────────────── */}
      {loading && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full flex-shrink-0" />
            <p className="font-semibold text-blue-900">Running Constitutional Auditor…</p>
          </div>
          <div className="ml-8 space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Scout E2B — pre-processing artifacts
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-300" />
              Analyst E4B — cross-modal reasoning (est. 10–15s on Pi 5)
            </div>
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold mb-1">Synthesis failed</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={handleSynthesise}
            className="mt-3 px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {dossier && (
        <div className="space-y-6">

          {/* ── Latency dashboard ──────────────────────────────── */}
          {dossier.latency_ms && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Processing Telemetry
                </span>
                <span className="ml-auto text-xs text-slate-400 font-mono">Raspberry Pi 5 · CPU only</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                {[
                  { label: "Scout", sublabel: "E2B · 2B params", ms: dossier.latency_ms.scout_ms, color: "text-blue-700", bg: "bg-blue-50" },
                  { label: "Analyst", sublabel: "E4B · 4B params", ms: dossier.latency_ms.analyst_ms, color: "text-indigo-700", bg: "bg-indigo-50" },
                  { label: "Total", sublabel: "Wall clock", ms: dossier.latency_ms.total_ms, color: "text-slate-800", bg: "bg-slate-50" },
                ].map(({ label, sublabel, ms, color, bg }) => (
                  <div key={label} className={`px-6 py-5 ${bg}`}>
                    <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                    <p className={`text-3xl font-bold font-mono ${color}`}>
                      {(ms / 1000).toFixed(2)}s
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{sublabel}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Core dossier fields ────────────────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Core Information</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Extracted and reconciled across all uploaded artifacts
              </p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              {[
                { label: "Full Name", value: dossier.full_name, modality: dossier.full_name_modality, source: dossier.full_name_source },
                { label: "Date of Birth", value: dossier.dob, modality: dossier.dob_modality, source: dossier.dob_source },
                { label: "Nationality", value: dossier.nationality, modality: dossier.nationality_modality, source: dossier.nationality_source },
                { label: "Country of Origin", value: dossier.country_of_origin, modality: dossier.country_of_origin_modality, source: dossier.country_of_origin_source },
              ].map(({ label, value, modality, source }) => (
                <div key={label}>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-slate-900">{value || "—"}</p>
                    {modality && <ProvenancePin modality={modality} source={source} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Conflict row if present */}
            {dossier.conflicts && dossier.conflicts.length > 0 && (
              <div className="mx-6 mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-600">⚠</span>
                  <p className="text-sm font-semibold text-amber-900">Cross-Modal Conflicts Detected</p>
                </div>
                {dossier.conflicts.map((conflict: any, i: number) => (
                  <div key={i} className="mt-2 flex items-start gap-2 text-sm text-amber-800">
                    <span className="font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-xs flex-shrink-0">
                      {conflict.field || "field"}
                    </span>
                    <span>{conflict.description || conflict.message || String(conflict)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Constitutional Auditor status ─────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Constitutional Auditor</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dual-pass safety check · Rule Pass + Prompt Pass</p>
              </div>
              <button
                onClick={() => setShowAuditorDetails(!showAuditorDetails)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {showAuditorDetails ? "Hide details" : "Show details"}
              </button>
            </div>

            <div className="p-6">
              {isClean ? (
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">✅</span>
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Clean — eligible for export</p>
                    <p className="text-sm text-green-700 mt-0.5">
                      No prohibited fields detected. All data complies with humanitarian data protection principles.
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-green-600 font-mono">
                      <span className="px-2 py-0.5 bg-green-100 rounded">rule_pass: CLEAN</span>
                      <span className="px-2 py-0.5 bg-green-100 rounded">prompt_pass: CLEAN</span>
                      <span className="px-2 py-0.5 bg-green-100 rounded">value_logged: false</span>
                    </div>
                  </div>
                </div>
              ) : isBlocked ? (
                <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🔒</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Block — sensitive field detected</p>
                    <p className="text-sm text-red-700 mt-0.5">
                      {dossier.triage_reason || "A prohibited field category was detected and quarantined."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded">rule_pass: BLOCK</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">prompt_pass: skipped</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">value_logged: false</span>
                    </div>
                    {dossier.blocked_fields?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {dossier.blocked_fields.map((f: string) => (
                          <span key={f} className="px-2 py-0.5 bg-red-200 text-red-900 rounded text-xs font-mono">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-medium text-amber-900">Requires caseworker review</p>
                    <p className="text-sm text-amber-700">{dossier.triage_reason || "Check details below"}</p>
                  </div>
                </div>
              )}

              {showAuditorDetails && (
                <div className="mt-5">
                  <AuditorPanel
                    auditorStatus={dossier.auditor_status}
                    blockedFields={dossier.blocked_fields || []}
                    rulePassResult={dossier.rule_pass_result}
                    promptPassResult={dossier.prompt_pass_result}
                    triageReason={dossier.triage_reason}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Override option ────────────────────────────────── */}
          {isBlocked && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚖️</span>
                <p className="font-semibold text-red-900">Caseworker Override Available</p>
              </div>
              <p className="text-sm text-red-800 mb-4">
                You may commit this record with your signature. Your decision will be logged with a
                timestamp and caseworker identity for accountability. This action cannot be undone.
              </p>
              <OverrideButton
                blockedFieldCount={dossier.blocked_fields?.length || 0}
                onConfirm={handleOverrideCommit}
                disabled={!dossier}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────────── */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 2 })}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back to Ingest
        </button>
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 4 })}
          disabled={!dossier}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
        >
          View Reasoning →
        </button>
      </div>
    </div>
  );
}

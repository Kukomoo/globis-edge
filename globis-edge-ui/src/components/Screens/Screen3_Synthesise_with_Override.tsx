import { useState, useEffect } from "react";
import { useSession } from "../../store/SessionContext";
import { synthesise } from "../../services/api";
import { ProvenancePin } from "../UI/ProvenancePin";
import { AuditorPanel } from "../UI/AuditorPanel";
import { OverrideButton } from "../UI/OverrideButton";

export function Screen3_Synthesise_with_Override() {
  const { state, dispatch } = useSession();
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [showAuditorDetails, setShowAuditor] = useState(false);

  useEffect(() => {
    if (!state.dossier && state.id) handleSynthesise();
  }, []);

  const handleSynthesise = async () => {
    if (!state.id) return;
    setLoading(true); setError(null);
    try {
      const res = await synthesise(state.id);
      dispatch({ type: "SET_DOSSIER", payload: res.data });
    } catch (err: any) {
      setError(err.message || "Synthesis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = (signature: string) => {
    if (!state.dossier) return;
    dispatch({
      type: "SET_DOSSIER",
      payload: {
        ...state.dossier,
        override_decision: {
          timestamp: new Date().toISOString(),
          caseworker: signature,
          session_id: state.id,
          blocked_fields: state.dossier.blocked_fields || [],
          action: "COMMIT_WITH_AWARENESS",
        },
        case_readiness: { ...state.dossier.case_readiness, eligible_for_export: true },
      },
    });
    dispatch({ type: "SET_SCREEN", payload: 4 });
  };

  const d = state.dossier;
  const isClean   = d?.auditor_status === "clean";
  const isBlocked = d?.auditor_status === "blocked";

  return (
    <div className="space-y-8">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Synthesised Dossier</h1>
        <p className="text-sm text-slate-500 mt-1">
          Unified view across all modalities · Constitutional Audit complete
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5" role="status" aria-live="polite">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="font-semibold text-blue-900 text-sm">Running Constitutional Auditor…</p>
          </div>
          <div className="ml-7 space-y-1.5 text-xs text-blue-700">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
              Scout E2B — pre-processing artifacts
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
              Analyst E4B — cross-modal reasoning (est. 10–15s on Pi 5)
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-800 text-sm mb-1">Synthesis failed</p>
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <button onClick={handleSynthesise} className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
            Retry
          </button>
        </div>
      )}

      {d && (
        <>
          {/* Latency telemetry */}
          {d.latency_ms && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Processing Telemetry</span>
                <span className="text-xs font-mono text-slate-500">Raspberry Pi 5 · CPU only</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                {[
                  { label: "Scout",   sub: "E2B · 2B params",  ms: d.latency_ms.scout_ms,   color: "text-blue-700",   bg: "bg-blue-50/60" },
                  { label: "Analyst", sub: "E4B · 4B params",  ms: d.latency_ms.analyst_ms, color: "text-indigo-700", bg: "bg-indigo-50/60" },
                  { label: "Total",   sub: "Wall clock",        ms: d.latency_ms.total_ms,   color: "text-slate-800",  bg: "bg-slate-50" },
                ].map(({ label, sub, ms, color, bg }) => (
                  <div key={label} className={`px-5 py-4 ${bg}`}>
                    <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                    <p className={`text-xl font-bold font-mono ${color}`}>
                      {(ms / 1000).toFixed(2)}s
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core fields */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Core Information</p>
              <p className="text-xs text-slate-500 mt-0.5">Extracted and reconciled across all uploaded artifacts</p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-5">
              {[
                { label: "Full Name",         value: d.full_name,         mod: d.full_name_modality,         src: d.full_name_source },
                { label: "Date of Birth",     value: d.dob,               mod: d.dob_modality,               src: d.dob_source },
                { label: "Nationality",       value: d.nationality,       mod: d.nationality_modality,       src: d.nationality_source },
                { label: "Country of Origin", value: d.country_of_origin, mod: d.country_of_origin_modality, src: d.country_of_origin_source },
              ].map(({ label, value, mod, src }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                  <div className="flex items-center gap-2">
                    <p className={label === "Full Name" ? "text-lg font-bold text-slate-900" : "text-base font-semibold text-slate-900"}>{value || "—"}</p>
                    {mod && <ProvenancePin modality={mod} source={src} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-modal conflicts — standalone card */}
          {d.conflicts?.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500 font-bold text-sm">⚠</span>
                <p className="text-sm font-semibold text-amber-900">Cross-Modal Conflicts Detected</p>
              </div>
              {d.conflicts.map((c: any, i: number) => {
                const summary = c.description || c.message
                  || (c.observed_values?.length
                      ? `${c.observed_values.join(" vs ")}${c.recommended_action ? " — " + c.recommended_action.replace(/_/g, " ") : ""}`
                      : typeof c === "string" ? c : JSON.stringify(c));
                return (
                  <div key={i} className="flex items-start gap-2 mt-1.5">
                    <span className="font-mono bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-xs flex-shrink-0 mt-0.5">
                      {c.field || "field"}
                    </span>
                    <div className="text-xs text-amber-800">
                      <span>{summary}</span>
                      {c.evidence?.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-amber-700 list-disc list-inside">
                          {c.evidence.map((e: string, j: number) => (
                            <li key={j} className="font-mono text-[10px]">{e}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Constitutional Auditor */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Constitutional Auditor</p>
                <p className="text-xs text-slate-500 mt-0.5">Dual-pass safety check · Rule Pass + Prompt Pass</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditor(!showAuditorDetails)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0 ml-4"
              >
                {showAuditorDetails ? "Hide" : "Show details"}
              </button>
            </div>

            <div className="p-6">
              {isClean && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-lg" aria-hidden="true">✅</div>
                  <div>
                    <p className="font-semibold text-green-900 text-sm">Clean — eligible for export</p>
                    <p className="text-xs text-green-700 mt-0.5">No prohibited fields detected. All data complies with humanitarian data protection principles.</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-mono">
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">rule_pass: CLEAN</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">prompt_pass: CLEAN</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">value_logged: false</span>
                    </div>
                  </div>
                </div>
              )}

              {isBlocked && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-lg" aria-hidden="true">🔒</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-red-900 text-sm">Block — sensitive field detected</p>
                    <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                      {d.triage_reason || "A prohibited field category was detected and quarantined."}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-mono">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded">rule_pass: BLOCK</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">prompt_pass: skipped</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">value_logged: false</span>
                    </div>
                    {d.blocked_fields?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {d.blocked_fields.map((f: string) => (
                          <span key={f} className="px-2 py-0.5 bg-red-200 text-red-900 rounded text-xs font-mono">🔒 {f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isClean && !isBlocked && d.auditor_status && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-xl" aria-hidden="true">⚠️</span>
                  <div>
                    <p className="font-medium text-amber-900 text-sm">Requires review</p>
                    <p className="text-xs text-amber-700">{d.triage_reason || "Check details below"}</p>
                  </div>
                </div>
              )}

              {showAuditorDetails && (
                <div className="mt-4">
                  <AuditorPanel
                    auditorStatus={d.auditor_status}
                    blockedFields={d.blocked_fields || []}
                    rulePassResult={d.rule_pass_result}
                    promptPassResult={d.prompt_pass_result}
                    triageReason={d.triage_reason}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Override */}
          {isBlocked && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden="true">⚖️</span>
                <p className="font-semibold text-red-900 text-sm">Caseworker Override Available</p>
              </div>
              <p className="text-xs text-red-800 mb-4 leading-relaxed">
                You may commit this record with your signature. Your decision will be logged with a
                timestamp and caseworker identity. The blocked values themselves are never recorded.
              </p>
              <OverrideButton
                blockedFieldCount={d.blocked_fields?.length || 0}
                onConfirm={handleOverride}
                disabled={!d}
              />
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 2 })}
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors"
        >
          ← Back to Ingest
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 4 })}
          disabled={!d}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm"
        >
          View Reasoning →
        </button>
      </div>
    </div>
  </div>
  );
}

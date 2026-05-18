import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { commitRecord } from "../../services/api";

export function Screen6_Commit() {
  const { state, dispatch } = useSession();
  const [decision, setDecision] = useState<"commit" | "quarantine" | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  const dossier = state.dossier;
  const isBlocked = dossier?.auditor_status === "blocked";
  const blockedFields: string[] = dossier?.blocked_fields || [];

  const handleCommit = async () => {
    if (!state.id || !decision) return;
    setLoading(true);
    setCommitError(null);
    try {
      await commitRecord({
        session_id: state.id,
        decision,
        caseworker_notes: notes,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Failed to commit record", err);
      setCommitError(err?.message || "Commit failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────
  if (submitted) {
    const isQuarantine = decision === "quarantine";
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className={`rounded-2xl border p-12 text-center ${
          isQuarantine
            ? "border-amber-200 bg-amber-50"
            : "border-green-200 bg-green-50"
        }`}>
          <div className="text-5xl mb-4">{isQuarantine ? "🗄️" : "✅"}</div>
          <h1 className={`text-2xl font-bold mb-2 ${
            isQuarantine ? "text-amber-900" : "text-green-900"
          }`}>
            {isQuarantine ? "Record Quarantined" : "Record Committed"}
          </h1>
          <p className={`text-sm mb-2 ${isQuarantine ? "text-amber-700" : "text-green-700"}`}>
            {isQuarantine
              ? "Flagged for senior caseworker review — no data exported."
              : "Intake record securely stored. Session data purged from memory."}
          </p>
          {state.id && (
            <p className="text-xs font-mono text-slate-400 mb-8">
              Session {state.id.slice(0, 8)} · {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
            </p>
          )}

          {/* Summary chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
              {isQuarantine ? "status: quarantine" : "status: committed"}
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
              blocked_fields: {blockedFields.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700">
              value_logged: false
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              prototype · human oversight required
            </span>
          </div>

          <button
            onClick={() => {
              dispatch({ type: "SET_SCREEN", payload: 1 });
              window.location.reload();
            }}
            className="px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors"
          >
            Start New Intake
          </button>
        </div>
      </div>
    );
  }

  // ── Main commit screen ─────────────────────────────────────────────
  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💾</span>
          <h1 className="text-3xl font-bold text-gray-900">Finalize Intake Record</h1>
        </div>
        <p className="text-gray-500 ml-11">
          Caseworker decision required — commit or quarantine this record
        </p>
      </div>

      {/* ── Case summary strip ─────────────────────────────────── */}
      {dossier && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
            Record Summary
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Name</p>
              <p className="font-semibold text-slate-800 truncate">{dossier.full_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Auditor Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                dossier.auditor_status === "clean"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {dossier.auditor_status === "clean" ? "✓ Clean" : "⚠ Blocked"}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Artifacts Ingested</p>
              <p className="font-semibold text-slate-800">{state.artifacts.length}</p>
            </div>
          </div>
          {blockedFields.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2">Quarantined fields (not exported)</p>
              <div className="flex flex-wrap gap-1.5">
                {blockedFields.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-mono">
                    🔒 {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Decision cards ─────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-5">Caseworker Decision</h2>

        <div className="space-y-3 mb-6">
          {/* Commit option */}
          <button
            onClick={() => setDecision("commit")}
            className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
              decision === "commit"
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              decision === "commit" ? "border-blue-500 bg-blue-500" : "border-slate-300"
            }`}>
              {decision === "commit" && (
                <span className="w-2 h-2 rounded-full bg-white block" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-0.5">✅ Commit Record</p>
              <p className="text-sm text-slate-500">
                Information is complete and verified. Record will be exported to the offline
                PRIMES-aligned store. Blocked fields are permanently discarded.
              </p>
            </div>
          </button>

          {/* Quarantine option */}
          <button
            onClick={() => setDecision("quarantine")}
            className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
              decision === "quarantine"
                ? "border-amber-500 bg-amber-50"
                : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              decision === "quarantine" ? "border-amber-500 bg-amber-500" : "border-slate-300"
            }`}>
              {decision === "quarantine" && (
                <span className="w-2 h-2 rounded-full bg-white block" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-0.5">🗄️ Quarantine for Review</p>
              <p className="text-sm text-slate-500">
                Unresolved conflicts or missing information. Record is flagged and held — no
                data is exported until a senior caseworker clears it.
              </p>
            </div>
          </button>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Caseworker Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any relevant context, observations, or follow-up actions for this case…"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-slate-400 transition-shadow"
            rows={4}
          />
        </div>

        {/* Responsibility notice */}
        {isBlocked && (
          <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
            <span className="text-red-500 text-lg flex-shrink-0">⚠</span>
            <p className="text-sm text-red-800">
              This record has blocked fields from the Constitutional Auditor. Committing will
              log your name, timestamp, and the blocked field list in the audit trail. The
              blocked values themselves are never recorded.
            </p>
          </div>
        )}

        {/* Responsibility reminder */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-600">⚖️ Accountability:</strong> This decision is logged
            with your caseworker identity and an immutable timestamp. It forms part of the audit
            trail for this intake session. Ensure all cross-modal conflicts have been reviewed
            before committing. This is a prototype — decisions remain subject to human governance.
          </p>
        </div>

        {commitError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {commitError}
          </div>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 5 })}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back to Dignity Loop
        </button>
        <button
          onClick={handleCommit}
          disabled={loading || !decision}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors disabled:bg-gray-300 disabled:text-gray-500 ${
            decision === "quarantine"
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading
            ? "Submitting…"
            : decision === "quarantine"
              ? "Quarantine Record"
              : decision === "commit"
                ? "Commit Record"
                : "Select a decision above"}
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { commitRecord } from "../../services/api";

export function Screen6_Commit() {
  const { state, dispatch } = useSession();
  const [decision, setDecision] = useState<"commit" | "quarantine" | null>(null);
  const [notes, setNotes]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  const d = state.dossier;
  const isBlocked     = d?.auditor_status === "blocked";
  const blockedFields: string[] = d?.blocked_fields || [];

  const handleCommit = async () => {
    if (!decision) return;
    setLoading(true); setCommitError(null);
    try {
      if (state.id) {
        await commitRecord({ session_id: state.id, decision, caseworker_notes: notes });
      }
      setSubmitted(true);
    } catch (err: any) {
      setCommitError(err?.message || "Commit failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────
  if (submitted) {
    const isQ = decision === "quarantine";
    return (
      <div className="space-y-8">
        <div className={`rounded-2xl border p-10 text-center ${isQ ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
          <div className="text-5xl mb-4" aria-hidden="true">{isQ ? "🗄️" : "✅"}</div>
          <h1 className={`text-2xl font-bold mb-2 ${isQ ? "text-amber-900" : "text-green-900"}`}>
            {isQ ? "Record Held for Review" : "Record Saved"}
          </h1>
          <p className={`text-sm mb-2 ${isQ ? "text-amber-700" : "text-green-700"}`}>
            {isQ
              ? "Flagged for senior caseworker review. No data exported."
              : "Intake record securely stored. Session data purged from memory."}
          </p>
          {state.id && (
            <p className="text-xs font-mono text-[#6b7f8c] mb-8">
              Session {state.id.slice(0, 8)} · {new Date().toISOString().replace("T", " ").slice(0, 19)} UTC
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-white border border-[rgba(147,177,194,0.35)] text-[#3d4d58]">
              status: {isQ ? "quarantine" : "committed"}
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-[rgba(147,177,194,0.35)] text-[#3d4d58]">
              blocked_fields: {blockedFields.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700">
              value_logged: false
            </span>
            <span className="px-3 py-1 rounded-full bg-[#f7f9fa] border border-[rgba(147,177,194,0.35)] text-[#6b7f8c]">
              prototype · human oversight required
            </span>
          </div>
          <button
            onClick={() => { dispatch({ type: "SET_SCREEN", payload: 1 }); window.location.reload(); }}
            className="px-8 py-3 bg-[#1a1714] text-white rounded-xl font-semibold hover:bg-[#0d0b09] transition-colors"
          >
            Start New Intake
          </button>
        </div>
      </div>
    );
  }

  // ── Main commit UI ────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a2028]">Save the Record</h1>
        <p className="text-sm text-[#6b7f8c] mt-1">
          Your decision is needed before anything is stored
        </p>
      </div>

      {/* Case summary */}
      {d && (
        <div className="rounded-xl border border-[rgba(147,177,194,0.35)] bg-white p-6">
          <p className="text-xs font-semibold text-[#6b7f8c] uppercase tracking-wide mb-3">Record Summary</p>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <p className="text-xs text-[#6b7f8c] mb-0.5">Name</p>
              <p className="font-semibold text-[#1a2028] text-sm truncate">{d.full_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6b7f8c] mb-0.5">Auditor Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                d.auditor_status === "clean" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {d.auditor_status === "clean" ? "✓ Clean" : "⚠ Blocked"}
              </span>
            </div>
            <div>
              <p className="text-xs text-[#6b7f8c] mb-0.5">Artifacts</p>
              <p className="font-semibold text-[#1a2028] text-sm">{state.artifacts.length}</p>
            </div>
          </div>

          {blockedFields.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[rgba(147,177,194,0.35)]">
              <p className="text-xs text-[#6b7f8c] mb-2">Quarantined fields (not exported)</p>
              <div className="flex flex-wrap gap-1.5">
                {blockedFields.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-red-100 text-red-800 rounded-lg text-xs font-mono">
                    🔒 {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decision cards */}
      <div className="rounded-xl border border-[rgba(147,177,194,0.35)] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(147,177,194,0.35)]">
          <p className="text-sm font-semibold text-[#1a2028]">What do you want to do?</p>
          <p className="text-xs text-[#6b7f8c] mt-0.5">Choose one option to continue</p>
        </div>
        <div className="p-6 space-y-3">

          <div role="radiogroup" aria-label="Caseworker decision">
          {/* Commit */}
          <button
            type="button"
            role="radio"
            aria-checked={decision === "commit"}
            onClick={() => setDecision("commit")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              decision === "commit"
                ? "border-blue-500 bg-blue-50"
                : "border-[rgba(147,177,194,0.35)] hover:border-blue-300 hover:bg-blue-50/30"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              decision === "commit" ? "border-blue-500 bg-blue-500" : "border-[rgba(147,177,194,0.55)]"
            }`}>
              {decision === "commit" && <span className="w-2 h-2 rounded-full bg-white block" />}
            </div>
            <div>
              <p className="font-semibold text-[#1a2028] text-sm"><span aria-hidden="true">✅ </span>Save Record</p>
              <p className="text-xs text-[#6b7f8c] mt-0.5 leading-relaxed">
                Information is complete and verified. The record will be saved to the offline store.
                Any flagged items are permanently discarded — they are never stored.
              </p>
            </div>
          </button>

          {/* Quarantine */}
          <button
            type="button"
            role="radio"
            aria-checked={decision === "quarantine"}
            onClick={() => setDecision("quarantine")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all mt-3 ${
              decision === "quarantine"
                ? "border-amber-500 bg-amber-50"
                : "border-[rgba(147,177,194,0.35)] hover:border-amber-300 hover:bg-amber-50/30"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              decision === "quarantine" ? "border-amber-500 bg-amber-500" : "border-[rgba(147,177,194,0.55)]"
            }`}>
              {decision === "quarantine" && <span className="w-2 h-2 rounded-full bg-white block" />}
            </div>
            <div>
              <p className="font-semibold text-[#1a2028] text-sm"><span aria-hidden="true">🗄️ </span>Hold for Review</p>
              <p className="text-xs text-[#6b7f8c] mt-0.5 leading-relaxed">
                Something needs a second opinion. The record is held safely — nothing is sent
                until a senior colleague clears it.
              </p>
            </div>
          </button>
          </div>

          {/* Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#3d4d58] mb-1.5">
              Your Notes <span className="text-[#9bafba] font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any relevant context, observations, or follow-up actions…"
              className="w-full px-4 py-3 border border-[rgba(147,177,194,0.35)] rounded-xl text-sm text-[#1a2028]
                         placeholder-[#9bafba] resize-none focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Accountability notice */}
          {isBlocked && decision === "commit" && (
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-500 flex-shrink-0" aria-hidden="true">⚠</span>
              <p className="text-xs text-red-800 leading-relaxed">
                This record has blocked fields. Committing will log your name, timestamp,
                and the blocked field list in the audit trail. The blocked values themselves
                are never recorded.
              </p>
            </div>
          )}

          <div className="p-3.5 bg-[#f7f9fa] border border-[rgba(147,177,194,0.35)] rounded-xl">
            <p className="text-xs text-[#6b7f8c] leading-relaxed">
              <strong className="text-[#3d4d58]"><span aria-hidden="true">⚖️ </span>Accountability:</strong> This decision is logged
              with your caseworker identity and an immutable timestamp. This is a prototype —
              decisions remain subject to human governance and oversight.
            </p>
          </div>

          {commitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {commitError}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-[rgba(147,177,194,0.35)] mt-2" />
      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 5 })}
          className="flex-1 px-4 py-3 border border-[rgba(147,177,194,0.35)] rounded-xl font-medium text-sm text-[#3d4d58] hover:bg-[#f0f5f8] transition-colors"
        >
          ← Back to Confirmation
        </button>
        <button
          onClick={handleCommit}
          disabled={loading || !decision}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm
            disabled:bg-[#D5DEE3] disabled:text-[#9bafba]
            ${decision === "quarantine"
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {loading ? "Saving…"
            : decision === "quarantine" ? "Hold for Review"
            : decision === "commit"     ? "Save Record"
            : "Choose an option above"}
        </button>
      </div>
    </div>
  );
}

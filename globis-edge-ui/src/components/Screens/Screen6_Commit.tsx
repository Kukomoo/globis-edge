import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { commitRecord } from "../../services/api";

export function Screen6_Commit() {
  const { state, dispatch } = useSession();
  const [decision, setDecision] = useState<"commit" | "quarantine" | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCommit = async () => {
    if (!state.id || !decision) return;
    setLoading(true);
    try {
      await commitRecord({
        session_id: state.id,
        decision,
        caseworker_notes: notes,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to commit record", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-green-900 mb-2">✅ Record Committed</h1>
          <p className="text-green-700 mb-6">
            The intake record has been securely stored
          </p>
          <button
            onClick={() => {
              dispatch({ type: "SET_SCREEN", payload: 1 });
              window.location.reload();
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Start New Intake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Finalize Intake Record</h1>
      <p className="text-gray-600 mb-8">
        Review and commit or quarantine the intake record
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <h2 className="font-bold text-lg mb-6">Caseworker Decision</h2>

        <div className="space-y-4 mb-6">
          <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50"
            style={{ borderColor: decision === "commit" ? "#3b82f6" : undefined }}>
            <input
              type="radio"
              name="decision"
              value="commit"
              checked={decision === "commit"}
              onChange={() => setDecision("commit")}
              className="w-5 h-5 mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">✅ Commit Record</p>
              <p className="text-sm text-gray-600">
                Information is complete and verified. Ready for export to PRIMES.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-yellow-300 hover:bg-yellow-50"
            style={{ borderColor: decision === "quarantine" ? "#f59e0b" : undefined }}>
            <input
              type="radio"
              name="decision"
              value="quarantine"
              checked={decision === "quarantine"}
              onChange={() => setDecision("quarantine")}
              className="w-5 h-5 mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">⚠️ Quarantine</p>
              <p className="text-sm text-gray-600">
                Conflicts or missing information require human review before export.
              </p>
            </div>
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caseworker Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes on this case..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            <strong>⚖️ Responsibility Reminder:</strong> This decision will be
            logged and auditable. Ensure all cross-modal conflicts have been
            reviewed before committing.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 5 })}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleCommit}
          disabled={loading || !decision}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Finalize & Commit"}
        </button>
      </div>
    </div>
  );
}

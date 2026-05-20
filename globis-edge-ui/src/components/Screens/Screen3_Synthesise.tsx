import { useState, useEffect } from "react";
import { useSession } from "../../store/SessionContext";
import { synthesise } from "../../services/api";
import { ConflictChip } from "../UI/ConflictChip";

export function Screen3_Synthesise() {
  const { state, dispatch } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Synthesised Dossier</h1>
      <p className="text-gray-600 mb-8">
        Unified view of all artifacts with provenance and conflicts
      </p>

      {loading && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          Running Constitutional Auditor (this may take 10-15 seconds on Pi 5)...
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      {state.dossier && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Core Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-medium">
                  {state.dossier.full_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-lg font-medium">
                  {state.dossier.dob || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Origin</p>
                <p className="text-lg font-medium">
                  {state.dossier.origin || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Family Size</p>
                <p className="text-lg font-medium">
                  {state.dossier.family_size || "—"}
                </p>
              </div>
            </div>
          </div>

          {state.dossier.conflicts && state.dossier.conflicts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-yellow-900 mb-4">
                Cross-Modal Conflicts ({state.dossier.conflicts.length})
              </h3>
              <div className="space-y-2">
                {state.dossier.conflicts.map((conflict: any, idx: number) => (
                  <ConflictChip key={idx} conflict={conflict} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Auditor Status</h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Status:</strong>{" "}
              {state.dossier.auditor_status === "clean"
                ? "✅ Clean for commit"
                : "⚠️ " + state.dossier.auditor_status}
            </p>
            {state.dossier.triage_reason && (
              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {state.dossier.triage_reason}
              </p>
            )}
          </div>
        </>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 2 })}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 4 })}
          disabled={!state.dossier}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          Continue to Explainer
        </button>
      </div>
    </div>
  );
}

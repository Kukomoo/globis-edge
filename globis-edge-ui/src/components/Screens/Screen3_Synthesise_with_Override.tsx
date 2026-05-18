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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Synthesised Dossier</h1>
      <p className="text-gray-600 mb-8">
        Unified view of all artifacts with provenance and conflicts
      </p>

      {loading && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Running Constitutional Auditor...</span>
          </div>
          <p className="text-sm">
            Scout preprocessing + Analyst reasoning (est. 10–15 seconds on Pi 5)
          </p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      {state.dossier && (
        <>
          {/* LATENCY BADGES */}
          {state.dossier.latency_ms && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Processing Summary
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Scout (E2B, 2B)</p>
                  <p className="text-lg font-bold text-green-700">
                    {(state.dossier.latency_ms.scout_ms / 1000).toFixed(2)}s
                  </p>
                  <p className="text-xs text-gray-500">Pre-processing</p>
                </div>
                <div>
                  <p className="text-gray-600">Analyst (E4B, 4B)</p>
                  <p className="text-lg font-bold text-green-700">
                    {(state.dossier.latency_ms.analyst_ms / 1000).toFixed(2)}s
                  </p>
                  <p className="text-xs text-gray-500">Reasoning</p>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="text-lg font-bold text-green-700">
                    {(state.dossier.latency_ms.total_ms / 1000).toFixed(2)}s
                  </p>
                  <p className="text-xs text-gray-500">On Pi 5 CPU</p>
                </div>
              </div>
            </div>
          )}

          {/* DOSSIER WITH PROVENANCE */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Core Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">
                    {state.dossier.full_name || "—"}
                  </p>
                  {state.dossier.full_name_modality && (
                    <ProvenancePin
                      modality={state.dossier.full_name_modality}
                      source={state.dossier.full_name_source}
                    />
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">
                    {state.dossier.dob || "—"}
                  </p>
                  {state.dossier.dob_modality && (
                    <ProvenancePin
                      modality={state.dossier.dob_modality}
                      source={state.dossier.dob_source}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CONSTITUTIONAL AUDITOR */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                Constitutional Auditor Status
              </h3>
              <button
                onClick={() => setShowAuditorDetails(!showAuditorDetails)}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                {showAuditorDetails ? "Hide details" : "Show details"}
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Status Summary
              </p>
              <div className="flex items-center gap-3">
                {state.dossier.auditor_status === "clean" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-medium text-green-900">
                        Clean for commit
                      </p>
                      <p className="text-xs text-gray-600">
                        No sensitive fields detected
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-medium text-yellow-900">
                        Requires review
                      </p>
                      <p className="text-xs text-gray-600">
                        {state.dossier.triage_reason || "Check details below"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showAuditorDetails && (
              <AuditorPanel
                auditorStatus={state.dossier.auditor_status}
                blockedFields={state.dossier.blocked_fields || []}
                rulePassResult={state.dossier.rule_pass_result}
                promptPassResult={state.dossier.prompt_pass_result}
                triageReason={state.dossier.triage_reason}
              />
            )}
          </div>

          {/* OVERRIDE OPTION */}
          {state.dossier?.auditor_status === "blocked" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-bold text-red-900 mb-3">
                💡 Option: Commit with Awareness
              </p>
              <p className="text-sm text-red-800 mb-4">
                You can override the block and commit this record with your
                signature. Your decision will be logged with timestamp and
                caseworker identity.
              </p>
              <OverrideButton
                blockedFieldCount={state.dossier?.blocked_fields?.length || 0}
                onConfirm={handleOverrideCommit}
                disabled={!state.dossier}
              />
            </div>
          )}
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

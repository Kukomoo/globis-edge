import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { ReasoningCard } from "../UI/ReasoningCard";
import { GlossaryTooltip } from "../UI/GlossaryTooltip";

interface ReasoningTrace {
  field: string;
  verdict: "PASS" | "BLOCK";
  claim: string;
  reasoning: string;
  evidence: string;
  artifact_id?: string;
  artifact_type?: "image" | "audio" | "text";
  source_timestamp?: string;
  supporting_sources?: string[];
}

export function Screen4_FastpathExplainer() {
  const { state, dispatch } = useSession();
  const [expandAll, setExpandAll] = useState(false);

  // Get reasoning traces from dossier
  const reasoningTraces: ReasoningTrace[] =
    state.dossier?.reasoning_traces || [];

  // Calculate summary stats
  const blockedCount = reasoningTraces.filter(
    (r) => r.verdict === "BLOCK"
  ).length;
  const passedCount = reasoningTraces.filter(
    (r) => r.verdict === "PASS"
  ).length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Reasoning Behind Audit Decisions</h1>
      <p className="text-gray-600 mb-8">
        Understand why each field was approved or blocked
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Passed Checks</p>
          <p className="text-2xl font-bold text-green-700">{passedCount}</p>
          <p className="text-xs text-gray-500">Fields approved for export</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Flagged Fields</p>
          <p className="text-2xl font-bold text-yellow-700">{blockedCount}</p>
          <p className="text-xs text-gray-500">
            {blockedCount === 0
              ? "No issues detected"
              : "Requires review or override"}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-900">
          <strong>How to read this:</strong> Each card below shows one field from
          your intake. Click "View Evidence" to see the model's reasoning and
          which artifact provided the information. This helps you understand (and
          challenge, if needed) the Constitutional Auditor's decisions.
        </p>
      </div>

      {/* Reasoning Cards */}
      {reasoningTraces.length > 0 ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Field-by-Field Breakdown</h2>
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              {expandAll ? "Collapse All" : "Expand All"}
            </button>
          </div>

          {reasoningTraces.map((trace, idx) => (
            <ReasoningCard
              key={idx}
              field={trace.field}
              verdict={trace.verdict}
              claim={trace.claim}
              reasoning={trace.reasoning}
              evidence={trace.evidence}
              artifactId={trace.artifact_id}
              artifactType={trace.artifact_type}
              sourceTimestamp={trace.source_timestamp}
              supportingSources={trace.supporting_sources}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8 text-center">
          <p className="text-gray-600">
            No reasoning traces available. The backend may still be processing.
          </p>
        </div>
      )}

      {/* Overall Audit Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Overall Audit Summary</h2>

        {blockedCount === 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-900 font-medium mb-2">
              ✅ All fields passed Constitutional Audit
            </p>
            <p className="text-sm text-gray-700">
              This record is ready for export. No protected fields were detected,
              and all data complies with humanitarian principles.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-900 font-medium mb-2">
              ⚠️ {blockedCount} field(s) require review
            </p>
            <p className="text-sm text-gray-700 mb-3">
              The following fields were blocked for protection reasons. You can:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>
                • <strong>Understand why</strong> by reading the reasoning above
              </li>
              <li>
                • <strong>View evidence</strong> by clicking "View Evidence" on
                each card
              </li>
              <li>
                • <strong>Commit with awareness</strong> on the next screen if
                you choose to proceed
              </li>
            </ul>
          </div>
        )}

        {/* Caseworker Guidance */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">
            💡 Tips for using this screen:
          </p>
          <ul className="text-sm text-gray-700 space-y-1 ml-4">
            <li>
              • Click "View Evidence" to see direct quotes from the model and
              artifact sources
            </li>
            <li>
              • The color icons (◐ ♪ ¶) show which artifact type provided each
              fact
            </li>
            <li>
              • Blocked fields are protected by international refugee law —
              they're not recorded in the final export
            </li>
            <li>
              • If you disagree with a decision, you can note it in your case
              comments
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 3 })}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Back to Dossier
        </button>
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 5 })}
          disabled={!state.dossier}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          Continue to Refugee View
        </button>
      </div>

      {/* Legal Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600">
        <p>
          <strong>Legal Note:</strong> The{" "}
          <GlossaryTooltip termId="constitutional_auditor">
            Constitutional Auditor
          </GlossaryTooltip>{" "}
          implements data protection principles from the 1951 Refugee Convention (
          <GlossaryTooltip termId="article_31">Article 31</GlossaryTooltip>) and
          UNHCR guidance. Blocked fields are never exported or retained beyond
          this session. All audit decisions are logged with timestamp and
          caseworker identity.
        </p>
      </div>
    </div>
  );
}

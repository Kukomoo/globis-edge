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

  const traces: ReasoningTrace[] = state.dossier?.reasoning_traces || [];
  const passed  = traces.filter((r) => r.verdict === "PASS").length;
  const blocked = traces.filter((r) => r.verdict === "BLOCK").length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a2028]">Why Each Field Was Checked</h1>
        <p className="text-sm text-[#6b7f8c] mt-1">
          A plain explanation of each piece of information — what the system found and why
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[rgba(147,177,194,0.35)] bg-white p-4">
          <p className="text-xs font-semibold text-[#6b7f8c] uppercase tracking-wide mb-1">Total Checks</p>
          <p className="text-3xl font-bold font-mono text-[#1a2028]">{traces.length}</p>
          <p className="text-xs text-[#9bafba] mt-0.5">Fields checked by Gemma Analyst</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Passed</p>
          <p className="text-3xl font-bold font-mono text-green-700">{passed}</p>
          <p className="text-xs text-green-600 mt-0.5">Ready to save</p>
        </div>
        <div className={`rounded-xl border p-4 ${blocked > 0 ? "border-red-200 bg-red-50" : "border-[rgba(147,177,194,0.35)] bg-[#f7f9fa]"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${blocked > 0 ? "text-red-600" : "text-[#6b7f8c]"}`}>
            Needs Review
          </p>
          <p className={`text-3xl font-bold font-mono ${blocked > 0 ? "text-red-700" : "text-[#d9d4ca]"}`}>{blocked}</p>
          <p className={`text-xs mt-0.5 ${blocked > 0 ? "text-red-600" : "text-[#6b7f8c]"}`}>
            {blocked === 0 ? "Nothing flagged" : "Caseworker must check"}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
        <span className="text-blue-400 text-base flex-shrink-0 mt-0.5">ℹ</span>
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>How to use this page:</strong> Each card shows one piece of information found in the documents or testimony.
          Tap <em>View Evidence</em> to see exactly where it came from. If something is flagged as needing review,
          the sensitive value is never stored — only the caseworker's decision is recorded.
        </p>
      </div>

      {/* Reasoning cards */}
      {traces.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1a2028]">Each piece of information, explained</p>
            <button
              type="button"
              onClick={() => setExpandAll(!expandAll)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {expandAll ? "Collapse All" : "Expand All"}
            </button>
          </div>
          <div className="space-y-3">
            {traces.map((trace, idx) => (
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
        </div>
      ) : (
        <div className="rounded-xl border border-[rgba(147,177,194,0.35)] bg-[#f7f9fa] p-12 text-center">
          <p className="text-[#6b7f8c] text-sm">No information yet. Complete the case summary first.</p>
        </div>
      )}

      {/* Audit summary */}
      <div className="rounded-xl border border-[rgba(147,177,194,0.35)] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(147,177,194,0.35)]">
          <p className="text-sm font-semibold text-[#1a2028]">Review complete</p>
        </div>
        <div className="p-6">
          {blocked === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-lg">✅</div>
              <div>
                <p className="font-semibold text-green-900 text-sm">All {passed} items passed — record is ready to save</p>
                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  No sensitive or protected information was detected. You can proceed to the next step.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-lg">⚠️</div>
              <div>
                <p className="font-semibold text-amber-900 text-sm">
                  {blocked} item{blocked > 1 ? "s" : ""} flagged — your review is needed
                </p>
                <ul className="text-xs text-amber-800 mt-2 space-y-0.5">
                  <li>· Read the explanations above to understand what was flagged</li>
                  <li>· You can proceed with your approval (your name will be recorded)</li>
                  <li>· Or hold the record for a senior colleague to review</li>
                </ul>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-[rgba(147,177,194,0.35)] grid grid-cols-2 gap-3">
            {[
              { icon: "◐", tip: "From a document", desc: "Came from an ID or passport photo" },
              { icon: "♪", tip: "From audio",       desc: "Came from recorded testimony" },
              { icon: "¶", tip: "From notes",        desc: "Came from caseworker observations" },
              { icon: "🔒", tip: "Flagged",          desc: "Sensitive — value never stored" },
            ].map(({ icon, tip, desc }) => (
              <div key={tip} className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#f0f5f8] flex items-center justify-center text-sm flex-shrink-0 font-mono">
                  {icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#3d4d58]">{tip}</p>
                  <p className="text-xs text-[#6b7f8c]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-[rgba(147,177,194,0.35)] mt-2" />
      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 3 })}
          className="flex-1 px-4 py-3 border border-[rgba(147,177,194,0.35)] rounded-xl font-medium text-sm text-[#3d4d58] hover:bg-[#f0f5f8] transition-colors"
        >
          ← Back to Summary
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 5 })}
          disabled={!state.dossier}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:bg-[#D5DEE3] disabled:text-[#9bafba] transition-colors shadow-sm"
        >
          Confirm with Person →
        </button>
      </div>

      {/* Legal note */}
      <div className="rounded-xl bg-[#f7f9fa] border border-[rgba(147,177,194,0.35)] p-4 text-xs text-[#6b7f8c] leading-relaxed">
        <strong className="text-[#3d4d58]">Legal note:</strong>{" "}
        The <GlossaryTooltip termId="constitutional_auditor">Safety Check</GlossaryTooltip>{" "}
        applies data protection principles from the 1951 Refugee Convention (
        <GlossaryTooltip termId="article_31">Article 31</GlossaryTooltip>) and UNHCR guidance.
        Flagged values are never stored or sent beyond this session.
      </div>
    </div>
  );
}

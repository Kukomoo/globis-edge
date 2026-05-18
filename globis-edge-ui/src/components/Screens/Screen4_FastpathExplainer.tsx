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
        <h1 className="text-2xl font-bold text-slate-900">Audit Reasoning</h1>
        <p className="text-sm text-slate-500 mt-1">
          Field-by-field explainability — why each claim was approved or blocked
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Checks</p>
          <p className="text-3xl font-bold font-mono text-slate-800">{traces.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Fields audited by E4B</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Passed</p>
          <p className="text-3xl font-bold font-mono text-green-700">{passed}</p>
          <p className="text-xs text-green-600 mt-0.5">Approved for export</p>
        </div>
        <div className={`rounded-xl border p-4 ${blocked > 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${blocked > 0 ? "text-red-600" : "text-slate-500"}`}>
            Blocked
          </p>
          <p className={`text-3xl font-bold font-mono ${blocked > 0 ? "text-red-700" : "text-slate-300"}`}>{blocked}</p>
          <p className={`text-xs mt-0.5 ${blocked > 0 ? "text-red-600" : "text-slate-500"}`}>
            {blocked === 0 ? "None detected" : "Requires review"}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
        <span className="text-blue-400 text-base flex-shrink-0 mt-0.5">ℹ</span>
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>How to read this:</strong> Each card shows one field extracted from your artifacts.
          The provenance icon shows which artifact the claim came from. Click{" "}
          <em>View Evidence</em> to expand the model's reasoning. Blocked fields are never
          recorded or exported — the value is discarded immediately.
        </p>
      </div>

      {/* Reasoning cards */}
      {traces.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Field-by-Field Breakdown</p>
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-slate-500 text-sm">No reasoning traces available. Complete synthesis first.</p>
        </div>
      )}

      {/* Audit summary */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Overall Audit Summary</p>
        </div>
        <div className="p-6">
          {blocked === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-lg">✅</div>
              <div>
                <p className="font-semibold text-green-900 text-sm">All {passed} fields passed Constitutional Audit</p>
                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  No protected fields were detected. This record is ready for export.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-lg">⚠️</div>
              <div>
                <p className="font-semibold text-amber-900 text-sm">
                  {blocked} field{blocked > 1 ? "s" : ""} blocked — caseworker action required
                </p>
                <ul className="text-xs text-amber-800 mt-2 space-y-0.5">
                  <li>· Read the reasoning above to understand why</li>
                  <li>· Proceed to commit with awareness (with your signature)</li>
                  <li>· Quarantine the record for senior caseworker review</li>
                </ul>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            {[
              { icon: "◐", tip: "Image provenance", desc: "Fact from ID / passport photo" },
              { icon: "♪", tip: "Audio provenance",  desc: "Fact from transcribed testimony" },
              { icon: "¶", tip: "Text provenance",   desc: "Fact from caseworker notes" },
              { icon: "🔒", tip: "Blocked field",    desc: "Value quarantined — never logged" },
            ].map(({ icon, tip, desc }) => (
              <div key={tip} className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm flex-shrink-0 font-mono">
                  {icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{tip}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-slate-100 mt-2" />
      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 3 })}
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors"
        >
          ← Back to Dossier
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 5 })}
          disabled={!state.dossier}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm"
        >
          Dignity Loop →
        </button>
      </div>

      {/* Legal note */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed">
        <strong className="text-slate-600">Legal note:</strong>{" "}
        The <GlossaryTooltip termId="constitutional_auditor">Constitutional Auditor</GlossaryTooltip>{" "}
        implements data protection principles from the 1951 Refugee Convention (
        <GlossaryTooltip termId="article_31">Article 31</GlossaryTooltip>) and UNHCR guidance.
        Blocked fields are never exported or retained beyond this session.
      </div>
    </div>
  );
}

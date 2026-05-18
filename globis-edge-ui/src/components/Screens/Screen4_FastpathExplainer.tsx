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

  const reasoningTraces: ReasoningTrace[] = state.dossier?.reasoning_traces || [];
  const blockedCount = reasoningTraces.filter((r) => r.verdict === "BLOCK").length;
  const passedCount = reasoningTraces.filter((r) => r.verdict === "PASS").length;
  const totalCount = reasoningTraces.length;

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🔍</span>
          <h1 className="text-3xl font-bold text-gray-900">Audit Reasoning</h1>
        </div>
        <p className="text-gray-500 ml-11">
          Field-by-field explainability — why each claim was approved or blocked
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
            Total Checks
          </p>
          <p className="text-3xl font-bold font-mono text-slate-800">{totalCount}</p>
          <p className="text-xs text-slate-400 mt-1">Fields audited by E4B</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
            Passed
          </p>
          <p className="text-3xl font-bold font-mono text-green-700">{passedCount}</p>
          <p className="text-xs text-green-600 mt-1">Approved for export</p>
        </div>
        <div className={`rounded-xl border p-5 ${
          blockedCount > 0
            ? "border-red-200 bg-red-50"
            : "border-slate-200 bg-slate-50"
        }`}>
          <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${
            blockedCount > 0 ? "text-red-600" : "text-slate-400"
          }`}>
            Blocked / Flagged
          </p>
          <p className={`text-3xl font-bold font-mono ${
            blockedCount > 0 ? "text-red-700" : "text-slate-400"
          }`}>
            {blockedCount}
          </p>
          <p className={`text-xs mt-1 ${blockedCount > 0 ? "text-red-600" : "text-slate-400"}`}>
            {blockedCount === 0 ? "None detected" : "Requires review"}
          </p>
        </div>
      </div>

      {/* ── How-to banner ──────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 mb-6 flex gap-3">
        <span className="text-blue-500 text-lg flex-shrink-0">ℹ</span>
        <div className="text-sm text-blue-900">
          <strong>How to read this screen:</strong> Each card shows one field extracted from your
          intake artifacts. The provenance icon (image / audio / text) shows which artifact the
          claim came from. Click <em>View Evidence</em> to expand the model's reasoning trace.
          Blocked fields are never recorded or exported — the value is discarded.
        </div>
      </div>

      {/* ── Reasoning cards ────────────────────────────────────── */}
      {reasoningTraces.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">
              Field-by-Field Breakdown
            </h2>
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {expandAll ? "Collapse All" : "Expand All"}
            </button>
          </div>

          <div className="space-y-3">
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
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 mb-6 text-center">
          <p className="text-slate-400 text-sm">
            No reasoning traces available. Complete synthesis on the previous screen first.
          </p>
        </div>
      )}

      {/* ── Audit summary ──────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Overall Audit Summary</h2>
        </div>
        <div className="p-6">
          {blockedCount === 0 ? (
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span>✅</span>
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  All {passedCount} fields passed Constitutional Audit
                </p>
                <p className="text-sm text-green-700 mt-1">
                  No protected fields were detected. This record is ready for export. All data
                  complies with humanitarian data protection principles.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span>⚠️</span>
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  {blockedCount} field{blockedCount > 1 ? "s" : ""} blocked — caseworker action required
                </p>
                <p className="text-sm text-amber-800 mt-1 mb-3">
                  The field(s) above were quarantined by the Constitutional Auditor. You can:
                </p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>· Read the reasoning above to understand why</li>
                  <li>· Proceed to commit with awareness (with your signature)</li>
                  <li>· Quarantine the record for senior caseworker review</li>
                </ul>
              </div>
            </div>
          )}

          {/* Caseworker tips */}
          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
            {[
              { icon: "◐", tip: "Image provenance", desc: "Fact came from the uploaded ID / passport photo" },
              { icon: "♪", tip: "Audio provenance", desc: "Fact came from the transcribed audio testimony" },
              { icon: "¶", tip: "Text provenance", desc: "Fact came from caseworker notes or typed input" },
              { icon: "🔒", tip: "Blocked field", desc: "Value was quarantined — never logged or exported" },
            ].map(({ icon, tip, desc }) => (
              <div key={tip} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm flex-shrink-0 font-mono">
                  {icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{tip}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 3 })}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back to Dossier
        </button>
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 5 })}
          disabled={!state.dossier}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
        >
          Refugee View (Dignity Loop) →
        </button>
      </div>

      {/* ── Legal note ─────────────────────────────────────────── */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
        <strong className="text-slate-600">Legal note:</strong> The{" "}
        <GlossaryTooltip termId="constitutional_auditor">
          Constitutional Auditor
        </GlossaryTooltip>{" "}
        implements data protection principles from the 1951 Refugee Convention (
        <GlossaryTooltip termId="article_31">Article 31</GlossaryTooltip>) and
        UNHCR guidance on data minimisation and purpose limitation.
        Blocked fields are never exported or retained beyond this session.
        All audit decisions are logged with timestamp and caseworker identity.
      </div>
    </div>
  );
}

interface AuditorPanelProps {
  auditorStatus: "clean" | "blocked" | string;
  blockedFields?: string[];
  rulePassResult?: {
    verdict: "PASS" | "BLOCK";
    blocked_field_names?: string[];
    reason?: string;
  };
  promptPassResult?: {
    verdict: "PASS" | "BLOCK";
    reason?: string;
  };
  triageReason?: string;
}

export function AuditorPanel({
  auditorStatus,
  blockedFields = [],
  rulePassResult,
  promptPassResult,
  triageReason,
}: AuditorPanelProps) {
  return (
    <div className="bg-[#f7f9fa] rounded-xl border border-[rgba(147,177,194,0.35)] p-4 space-y-4">
      {/* RULE PASS */}
      <div>
        <p className="text-sm font-bold text-[#1a2028] mb-2">
          Pass 1: Rule Auditor (Protected Fields Check)
        </p>
        {rulePassResult ? (
          <div
            className={`p-3 rounded-xl text-sm ${
              rulePassResult.verdict === "PASS"
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{rulePassResult.verdict === "PASS" ? "✅" : "⚠️"}</span>
              <p className="font-medium">
                {rulePassResult.verdict === "PASS"
                  ? "No protected fields detected"
                  : "Protected fields blocked"}
              </p>
            </div>

            {rulePassResult.verdict === "BLOCK" && (
              <>
                <p className="text-xs text-[#6b7f8c] mb-2">Blocked fields:</p>
                <ul className="space-y-1">
                  {(
                    rulePassResult.blocked_field_names ||
                    blockedFields
                  ).map((field, idx) => (
                    <li key={idx} className="text-xs text-[#3d4d58] ml-4">
                      • <code className="bg-white px-1 rounded-xl">{field}</code> —
                      Prohibited under Article 31 (1951 Refugee Convention)
                    </li>
                  ))}
                </ul>
              </>
            )}

            {rulePassResult.reason && (
              <p className="text-xs text-[#6b7f8c] mt-2 italic">
                {rulePassResult.reason}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#6b7f8c] italic">
            (No rule pass data; backend may be processing)
          </p>
        )}
      </div>

      {/* PROMPT PASS */}
      <div>
        <p className="text-sm font-bold text-[#1a2028] mb-2">
          Pass 2: Prompt Auditor (Article 31 & ExCom Compliance Check)
        </p>
        {promptPassResult ? (
          <div
            className={`p-3 rounded-xl text-sm ${
              promptPassResult.verdict === "PASS"
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{promptPassResult.verdict === "PASS" ? "✅" : "⚠️"}</span>
              <p className="font-medium">
                {promptPassResult.verdict === "PASS"
                  ? "Compliant with humanitarian principles"
                  : "Compliance concern flagged"}
              </p>
            </div>

            {promptPassResult.reason && (
              <p className="text-xs text-[#3d4d58]">
                <strong>Reasoning:</strong> {promptPassResult.reason}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#6b7f8c] italic">
            (No prompt pass data; backend may be processing)
          </p>
        )}
      </div>

      {/* OVERALL DECISION */}
      <div className="border-t border-[rgba(147,177,194,0.35)] pt-4">
        <p className="text-sm font-bold text-[#1a2028] mb-2">Overall Decision</p>
        {auditorStatus === "clean" ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">
            <p className="text-green-900 font-medium">✅ Record is clean</p>
            <p className="text-xs text-[#6b7f8c] mt-1">
              Both Rule Pass and Prompt Pass approved. Record is ready for export.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
            <p className="text-yellow-900 font-medium">⚠️ Requires caseworker review</p>
            {triageReason && (
              <p className="text-xs text-[#3d4d58] mt-1">
                <strong>Reason:</strong> {triageReason}
              </p>
            )}
            <p className="text-xs text-[#6b7f8c] mt-2">
              You can proceed by choosing to commit (with full awareness) or quarantine
              (for protection team review) on the next screen.
            </p>
          </div>
        )}
      </div>

      {/* TRANSPARENCY NOTE */}
      <div className="border-t border-[rgba(147,177,194,0.35)] pt-4">
        <p className="text-xs text-[#6b7f8c] italic">
          📋 <strong>Audit Trail:</strong> This decision is logged with timestamp,
          session ID, and caseworker identity. All blocked fields and reasoning are
          documented in the audit log (not in the exported record).
        </p>
  </div>
  </div>
  );
}

import { useState } from "react";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface ReasoningCardProps {
  field: string;
  verdict: "PASS" | "BLOCK";
  claim: string;
  reasoning: string;
  evidence: string;
  artifactId?: string;
  artifactType?: "image" | "audio" | "text";
  sourceTimestamp?: string;
  supportingSources?: string[];
}

export function ReasoningCard({
  field,
  verdict,
  claim,
  reasoning,
  evidence,
  artifactId,
  artifactType,
  sourceTimestamp,
  supportingSources,
}: ReasoningCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const isPass = verdict === "PASS";

  const getArtifactColor = () => {
    switch (artifactType) {
      case "image":  return "text-blue-600";
      case "audio":  return "text-purple-600";
      case "text":   return "text-teal-600";
      default:       return "text-[#6b7f8c]";
    }
  };

  const getArtifactIcon = () => {
    switch (artifactType) {
      case "image": return "◐";
      case "audio": return "♪";
      case "text":  return "¶";
      default:      return "•";
    }
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${isPass ? "border-[rgba(147,177,194,0.35)] bg-white" : "border-amber-200 bg-amber-50"}`}>
      {/* Header: Verdict + Field */}
      <div className="flex items-start justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isPass ? "✅" : "⚠️"}</span>
          <div>
            <p className="font-semibold text-[#1a2028] text-sm">
              {isPass ? "Passed" : "Needs review"}
            </p>
            <p className="text-xs text-[#6b7f8c] mt-0.5">
              <code className="bg-[#f0f5f8] text-[#3d4d58] px-1.5 py-0.5 rounded font-mono text-[10px]">
                {field}
              </code>
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
            isPass
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {isPass ? "PASS" : "REVIEW"}
        </span>
      </div>

      <div className={`px-4 pb-4 space-y-3 ${!isPass ? "" : ""}`}>
        {/* Claim */}
        <div className="p-3 bg-[#f7f9fa] rounded-xl border border-[rgba(147,177,194,0.35)]">
          <p className="text-sm font-medium text-[#1a2028]">{claim}</p>
        </div>

        {/* Reasoning */}
        <div className="border-l-2 border-[rgba(147,177,194,0.35)] pl-3">
          <p className="text-sm text-[#3d4d58]">
            <strong className="text-[#1a2028]">Why: </strong>{reasoning}
          </p>
        </div>

        {/* Evidence (Toggle) */}
        <div>
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
          >
            {showEvidence ? "Hide Evidence" : "View Evidence"}
          </button>

          {showEvidence && (
            <div className="mt-2 p-3 bg-[#f7f9fa] rounded-xl border border-[rgba(147,177,194,0.35)]">
              <p className="text-xs font-semibold text-[#6b7f8c] mb-2 uppercase tracking-wide">Evidence from model:</p>
              <p className="text-sm text-[#3d4d58] italic">"{evidence}"</p>

              {/* Artifact Link */}
              {artifactId && (
                <div className="mt-3 pt-2 border-t border-[rgba(147,177,194,0.35)]">
                  <p className="text-xs text-[#6b7f8c] mb-1 font-medium">Source:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`text-lg ${getArtifactColor()}`}>
                      {getArtifactIcon()}
                    </span>
                    <span className="text-[#3d4d58] text-xs">
                      {artifactId.replace("artifact-", "").replace(/-/g, " ")}
                    </span>
                    {sourceTimestamp && (
                      <span className="text-[10px] text-[#9bafba] ml-auto">
                        @ {sourceTimestamp}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Supporting Sources */}
              {supportingSources && supportingSources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[rgba(147,177,194,0.35)]">
                  <p className="text-xs text-[#6b7f8c] mb-1 font-medium">Supported by:</p>
                  <ul className="space-y-1">
                    {supportingSources.map((source, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-[#3d4d58] flex items-center gap-1"
                      >
                        <span className="text-[#9bafba]">→</span>
                        {source.replace("artifact-", "").replace(/-/g, " ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legal/Humanitarian Reference */}
        {!isPass && (
          <div className="text-xs text-[#6b7f8c] italic border-t border-amber-200 pt-2">
            <p>
              🛡️ Protected under{" "}
              <GlossaryTooltip termId="article_31">
                Article 31 (1951 Refugee Convention)
              </GlossaryTooltip>{" "}
              and international refugee protection principles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

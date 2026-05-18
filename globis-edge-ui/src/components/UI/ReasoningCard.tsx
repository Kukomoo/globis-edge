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

  const getVerdictIcon = () => (verdict === "PASS" ? "✅" : "⚠️");
  const getVerdictColor = () =>
    verdict === "PASS"
      ? "border-green-200 bg-green-50"
      : "border-yellow-200 bg-yellow-50";
  const getReasoningColor = () =>
    verdict === "PASS"
      ? "bg-green-100 text-green-900"
      : "bg-yellow-100 text-yellow-900";

  const getArtifactColor = () => {
    switch (artifactType) {
      case "image":
        return "text-pink-600"; // ◐
      case "audio":
        return "text-purple-600"; // ♪
      case "text":
        return "text-cyan-600"; // ¶
      default:
        return "text-gray-600";
    }
  };

  const getArtifactIcon = () => {
    switch (artifactType) {
      case "image":
        return "◐";
      case "audio":
        return "♪";
      case "text":
        return "¶";
      default:
        return "•";
    }
  };

  return (
    <div className={`rounded-lg border p-4 mb-4 ${getVerdictColor()}`}>
      {/* Header: Verdict + Field */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getVerdictIcon()}</span>
          <div>
            <p className="font-bold text-gray-900">
              {verdict === "BLOCK" ? "Field Blocked" : "Field Passed"}
            </p>
            <p className="text-sm text-gray-600">
              <code className="bg-white bg-opacity-50 px-1 rounded">
                {field}
              </code>
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded ${getReasoningColor()}`}
        >
          {verdict}
        </span>
      </div>

      {/* Claim */}
      <div className="mb-3 p-3 bg-white bg-opacity-50 rounded">
        <p className="text-sm font-medium text-gray-900">{claim}</p>
      </div>

      {/* Reasoning */}
      <div className="mb-3 border-l-4 border-current pl-3">
        <p className="text-sm text-gray-700">
          <strong>Why:</strong> {reasoning}
        </p>
      </div>

      {/* Evidence (Toggle) */}
      <div className="mb-3">
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
        >
          {showEvidence ? "Hide Evidence" : "View Evidence"}
        </button>

        {showEvidence && (
          <div className="mt-2 p-3 bg-white rounded border border-gray-200">
            <p className="text-xs font-bold text-gray-600 mb-2">MODEL OUTPUT:</p>
            <p className="text-sm text-gray-700 italic">"{evidence}"</p>

            {/* Artifact Link */}
            {artifactId && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Source:</strong>
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`text-lg ${getArtifactColor()}`}>
                    {getArtifactIcon()}
                  </span>
                  <span className="text-gray-700">
                    {artifactId.replace("artifact-", "").replace("-", " ")}
                  </span>
                  {sourceTimestamp && (
                    <span className="text-xs text-gray-500 ml-auto">
                      @ {sourceTimestamp}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Supporting Sources */}
            {supportingSources && supportingSources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Supported by:</strong>
                </p>
                <ul className="space-y-1">
                  {supportingSources.map((source, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-center gap-1"
                    >
                      <span className="text-xs">→</span>
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
      {verdict === "BLOCK" && (
        <div className="text-xs text-gray-600 italic border-t pt-2">
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
  );
}

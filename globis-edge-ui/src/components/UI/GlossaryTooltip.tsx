import { useState } from "react";
import { getGlossaryTermTranslation } from "../../data/glossary";

interface GlossaryTooltipProps {
  termId: string;
  children: React.ReactNode;
  language?: "en" | "ar" | "fr" | "am";
  className?: string;
}

export function GlossaryTooltip({
  termId,
  children,
  language = "en",
  className = "",
}: GlossaryTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const term = getGlossaryTermTranslation(termId, language);

  if (!term) {
    return <span className={className}>{children}</span>;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="border-b border-dotted border-blue-500 cursor-help hover:text-blue-600 transition"
      >
        {children}
      </span>

      {showTooltip && (
        <div className="absolute z-50 left-0 mt-2 w-80 bg-white border border-[rgba(147,177,194,0.5)] rounded-xl shadow-xl p-4">
          <p className="font-bold text-[#1a2028] text-sm mb-2">
            {term.term[language]}
          </p>

          <p className="text-[#3d4d58] text-sm leading-relaxed mb-3">
            {term.definition[language]}
          </p>

          {term.legal_reference && (
            <div className="border-t border-[rgba(147,177,194,0.35)] pt-2 mt-2">
              <p className="text-xs text-[#6b7f8c]">
                <span className="font-semibold">Source:</span> {term.legal_reference}
              </p>
            </div>
          )}

          {term.context && (
            <p className="text-xs text-[#9bafba] mt-2">
              <span className="font-semibold">Context:</span> {term.context}
            </p>
          )}

          {/* Arrow pointing up */}
          <div className="absolute bottom-full left-4 -mb-1">
            <div className="w-2 h-2 bg-white border-l border-t border-[rgba(147,177,194,0.5)] transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}

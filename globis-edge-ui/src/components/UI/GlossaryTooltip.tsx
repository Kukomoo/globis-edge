import { useState } from "react";
import { getGlossaryTermTranslation } from "../../data/glossary";

interface GlossaryTooltipProps {
  termId: string;
  children: React.ReactNode;
  language?: "en" | "ar" | "fr";
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
    // Term not found, just render children
    return <span className={className}>{children}</span>;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Dotted underline to show this is a glossary term */}
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="border-b border-dotted border-blue-500 cursor-help hover:text-blue-600 transition"
      >
        {children}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          {/* Term title */}
          <p className="font-bold text-gray-900 text-sm mb-2">
            {term.term[language]}
          </p>

          {/* Definition */}
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {term.definition[language]}
          </p>

          {/* Legal reference if available */}
          {term.legal_reference && (
            <div className="border-t border-gray-200 pt-2 mt-2">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Source:</span> {term.legal_reference}
              </p>
            </div>
          )}

          {/* Context */}
          {term.context && (
            <p className="text-xs text-gray-500 mt-2">
              <span className="font-semibold">Context:</span> {term.context}
            </p>
          )}

          {/* Arrow pointing up */}
          <div className="absolute bottom-full left-4 -mb-1">
            <div className="w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}

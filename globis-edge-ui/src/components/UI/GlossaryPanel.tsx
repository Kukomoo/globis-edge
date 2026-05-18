import { useState } from "react";
import { GLOSSARY_TERMS, searchGlossary } from "../../data/glossary";

interface GlossaryPanelProps {
  language?: "en" | "ar" | "fr";
  isOpen?: boolean;
  onClose?: () => void;
}

export function GlossaryPanel({
  language = "en",
  isOpen = false,
  onClose,
}: GlossaryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);

  const displayTerms = searchQuery.trim()
    ? searchGlossary(searchQuery, language)
    : GLOSSARY_TERMS;

  const languageLabels = {
    en: "English",
    ar: "العربية (Arabic)",
    fr: "Français (French)",
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
      onKeyDown={(e) => { if (e.key === "Escape") onClose?.(); }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-[rgba(147,177,194,0.35)] p-6 bg-[#f0f5f8]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 id="glossary-title" className="text-2xl font-bold text-[#1a2028]">
                <span aria-hidden="true">📚 </span>Humanitarian Glossary
              </h2>
              <p className="text-sm text-[#6b7f8c] mt-1">
                {languageLabels[language]}
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close glossary"
                className="text-[#6b7f8c] hover:text-[#3d4d58] text-2xl"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search */}
          <label htmlFor="glossary-search" className="sr-only">Search glossary terms</label>
          <input
            id="glossary-search"
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedTermId(null); // Reset expanded when searching
            }}
            className="w-full px-4 py-2 border border-[rgba(147,177,194,0.5)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-[#1a2028]"
          />
        </div>

        {/* Terms List */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {displayTerms.length === 0 ? (
            <p className="text-[#6b7f8c] text-center py-8">
              No terms found for "{searchQuery}"
            </p>
          ) : (
            displayTerms.map((term) => (
              <div
                key={term.id}
                className="border border-[rgba(147,177,194,0.35)] rounded-xl overflow-hidden hover:border-blue-300 transition"
              >
                {/* Term Header */}
                <button
                  type="button"
                  aria-expanded={expandedTermId === term.id}
                  aria-controls={`term-detail-${term.id}`}
                  onClick={() =>
                    setExpandedTermId(
                      expandedTermId === term.id ? null : term.id
                    )
                  }
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f7f9fa] transition"
                >
                  <span className="font-semibold text-[#1a2028] text-left">
                    {term.term[language]}
                  </span>
                  <span className="text-[#6b7f8c] ml-2">
                    <span aria-hidden="true">{expandedTermId === term.id ? "▼" : "▶"}</span>
                  </span>
                </button>

                {/* Term Details */}
                {expandedTermId === term.id && (
                  <div id={`term-detail-${term.id}`} className="px-4 pb-4 bg-[#f7f9fa] border-t border-[rgba(147,177,194,0.35)]">
                    {/* Definition */}
                    <p className="text-[#3d4d58] text-sm leading-relaxed mb-3">
                      {term.definition[language]}
                    </p>

                    {/* Legal Reference */}
                    {term.legal_reference && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                        <p className="text-xs text-blue-900">
                          <span className="font-semibold">Legal Source:</span>{" "}
                          {term.legal_reference}
                        </p>
                      </div>
                    )}

                    {/* Context */}
                    {term.context && (
                      <p className="text-xs text-[#6b7f8c]">
                        <span className="font-semibold">Used in:</span>{" "}
                        {term.context
                          .split(",")
                          .map((c) => c.trim())
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(147,177,194,0.35)] p-4 bg-[#f7f9fa]">
          <p className="text-xs text-[#6b7f8c]">
            💡 Tip: Hover over dotted underlines in the app to see glossary tooltips. Click the
            book icon in the header to open this panel anytime.
          </p>
        </div>
  </div>
  </div>
  );
}

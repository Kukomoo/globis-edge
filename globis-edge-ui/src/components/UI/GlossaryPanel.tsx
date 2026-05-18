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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 bg-blue-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 id="glossary-title" className="text-2xl font-bold text-slate-900">
                <span aria-hidden="true">📚 </span>Humanitarian Glossary
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {languageLabels[language]}
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close glossary"
                className="text-slate-500 hover:text-slate-700 text-2xl"
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
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Terms List */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {displayTerms.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No terms found for "{searchQuery}"
            </p>
          ) : (
            displayTerms.map((term) => (
              <div
                key={term.id}
                className="border border-slate-200 rounded-lg overflow-hidden hover:border-blue-300 transition"
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
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <span className="font-semibold text-slate-900 text-left">
                    {term.term[language]}
                  </span>
                  <span className="text-slate-500 ml-2">
                    <span aria-hidden="true">{expandedTermId === term.id ? "▼" : "▶"}</span>
                  </span>
                </button>

                {/* Term Details */}
                {expandedTermId === term.id && (
                  <div id={`term-detail-${term.id}`} className="px-4 pb-4 bg-slate-50 border-t border-slate-200">
                    {/* Definition */}
                    <p className="text-slate-700 text-sm leading-relaxed mb-3">
                      {term.definition[language]}
                    </p>

                    {/* Legal Reference */}
                    {term.legal_reference && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <p className="text-xs text-blue-900">
                          <span className="font-semibold">Legal Source:</span>{" "}
                          {term.legal_reference}
                        </p>
                      </div>
                    )}

                    {/* Context */}
                    {term.context && (
                      <p className="text-xs text-slate-600">
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
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <p className="text-xs text-slate-600">
            💡 Tip: Hover over dotted underlines in the app to see glossary tooltips. Click the
            book icon in the header to open this panel anytime.
          </p>
        </div>
  );
}

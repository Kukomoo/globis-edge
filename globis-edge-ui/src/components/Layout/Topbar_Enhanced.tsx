import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { TestDataBadge } from "../UI/TestDataBadge";
import { GlossaryPanel } from "../UI/GlossaryPanel";

export function Topbar_Enhanced() {
  const { state } = useSession();
  const [showGlossary, setShowGlossary] = useState(false);
  const [glossaryLanguage, setGlossaryLanguage] = useState<"en" | "ar" | "fr">("en");

  // Check if dossier is synthetic
  const isSyntheticData = state.dossier?.is_synthetic_data || false;

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
        {/* Test Data Badge */}
        {isSyntheticData && (
          <div className="flex items-center gap-2">
            <TestDataBadge
              isSyntheticData={isSyntheticData}
              sessionId={state.id || undefined}
            />
          </div>
        )}

        {/* Session Info */}
        <div className="flex items-center gap-4 ml-auto">
          {state.id && (
            <span className="text-sm text-gray-600">
              Session: <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{state.id.slice(0, 8)}</code>
            </span>
          )}

          {state.current_screen && (
            <span className="text-sm text-gray-600">
              Screen <span className="font-semibold">{state.current_screen}</span> of 6
            </span>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>Demo Mode</span>
          </div>

          {/* Glossary Button */}
          <button
            onClick={() => setShowGlossary(true)}
            className="ml-4 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
            title="Open humanitarian glossary"
          >
            📚 Glossary
          </button>

          {/* Language Selector */}
          <select
            value={glossaryLanguage}
            onChange={(e) => setGlossaryLanguage(e.target.value as "en" | "ar" | "fr")}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </header>

      {/* Glossary Panel */}
      <GlossaryPanel
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
        language={glossaryLanguage}
      />
    </>
  );
}

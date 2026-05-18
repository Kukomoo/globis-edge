import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { TestDataBadge } from "../UI/TestDataBadge";
import { GlossaryPanel } from "../UI/GlossaryPanel";
import { DEMO_SCENARIO } from "../../data/demoScenario";
import { createSession } from "../../services/api";

export function Topbar_Enhanced() {
  const { state, dispatch } = useSession();
  const [showGlossary, setShowGlossary] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // ui_language is global session state — drives Glossary, Dignity Loop, and explainer
  const glossaryLanguage = state.ui_language ?? "en";

  // Check if dossier is synthetic
  const isSyntheticData = state.dossier?.is_synthetic_data || false;

  /**
   * One-click demo autofill:
   * 1. Calls /new-session with Yusuf's scenario data
   * 2. Injects synthetic artifacts into session state (no real upload needed)
   * 3. Dispatches LOAD_DEMO → jumps to Screen 2 with everything pre-filled
   */
  const handleLoadDemo = async () => {
    if (demoLoading) return;
    setDemoLoading(true);
    try {
      const response = await createSession(DEMO_SCENARIO.session);
      const sessionId: string = response.data.id;

      dispatch({
        type: "LOAD_DEMO",
        payload: {
          id: sessionId,
          site: DEMO_SCENARIO.session.site,
          caseworker_languages: [...DEMO_SCENARIO.session.caseworker_languages],
          beneficiary_languages: [...DEMO_SCENARIO.session.beneficiary_languages],
          artifacts: DEMO_SCENARIO.artifacts.map((a) => ({ ...a })),
        },
      });
    } catch (err) {
      console.error("Demo load failed:", err);
      // Still load the UI with a stub session id so the demo is usable offline
      dispatch({
        type: "LOAD_DEMO",
        payload: {
          id: "demo-" + Math.random().toString(36).slice(2, 10),
          site: DEMO_SCENARIO.session.site,
          caseworker_languages: [...DEMO_SCENARIO.session.caseworker_languages],
          beneficiary_languages: [...DEMO_SCENARIO.session.beneficiary_languages],
          artifacts: DEMO_SCENARIO.artifacts.map((a) => ({ ...a })),
        },
      });
    } finally {
      setDemoLoading(false);
    }
  };

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

        {/* ⚡ Load Demo button — always visible, prominent for judges */}
        <button
          onClick={handleLoadDemo}
          disabled={demoLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
            ${state.demo_loaded
              ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
              : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md"
            }
            disabled:opacity-60`}
          title="Pre-load Yusuf's synthetic scenario for a guided demo walkthrough"
        >
          {demoLoading
            ? "⏳ Loading..."
            : state.demo_loaded
              ? "✅ Demo Loaded"
              : "⚡ Load Demo"}
        </button>

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
            onChange={(e) => dispatch({ type: "SET_LANGUAGE", payload: e.target.value })}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
            <option value="am">አማርኛ</option>
          </select>
        </div>
      </header>

      {/* Glossary Panel — supports en/ar/fr; falls back to en for other locales */}
      <GlossaryPanel
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
        language={(["en", "ar", "fr"].includes(glossaryLanguage) ? glossaryLanguage : "en") as "en" | "ar" | "fr"}
      />
    </>
  );
}

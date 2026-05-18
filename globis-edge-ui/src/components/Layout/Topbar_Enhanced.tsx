import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { TestDataBadge } from "../UI/TestDataBadge";
import { GlossaryPanel } from "../UI/GlossaryPanel";
import { DEMO_SCENARIO_A, DEMO_SCENARIO_B } from "../../data/demoScenario";
import { createSession } from "../../services/api";

export function Topbar_Enhanced() {
  const { state, dispatch } = useSession();
  const [showGlossary, setShowGlossary] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState<"A" | "B">("A");

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
  const handleLoadDemo = async (scenario: "A" | "B" = activeScenario) => {
    if (demoLoading) return;
    const scenarioData = scenario === "A" ? DEMO_SCENARIO_A : DEMO_SCENARIO_B;
    setDemoLoading(true);
    setActiveScenario(scenario);
    try {
      const response = await createSession(scenarioData.session);
      const sessionId: string = response.data.id;

      dispatch({
        type: "LOAD_DEMO",
        payload: {
          id: sessionId,
          site: scenarioData.session.site,
          caseworker_languages: [...scenarioData.session.caseworker_languages],
          beneficiary_languages: [...scenarioData.session.beneficiary_languages],
          artifacts: scenarioData.artifacts.map((a) => ({ ...a })),
        },
      });
    } catch (err) {
      console.error("Demo load failed:", err);
      dispatch({
        type: "LOAD_DEMO",
        payload: {
          id: "demo-" + Math.random().toString(36).slice(2, 10),
          site: scenarioData.session.site,
          caseworker_languages: [...scenarioData.session.caseworker_languages],
          beneficiary_languages: [...scenarioData.session.beneficiary_languages],
          artifacts: scenarioData.artifacts.map((a) => ({ ...a })),
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

        {/* ⚡ Demo scenario selector — two scenarios for judges */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <span className="text-xs text-gray-500 font-medium px-1">Demo:</span>
          {(["A", "B"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleLoadDemo(s)}
              disabled={demoLoading}
              title={s === "A"
                ? "Scenario A — Hawa Adam: dossier reconstruction + cross-modal conflict"
                : "Scenario B — Yusuf Hassan: Constitutional Auditor block + quarantine chip"}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-60
                ${state.demo_loaded && activeScenario === s
                  ? "bg-green-500 text-white shadow-sm"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
            >
              {demoLoading && activeScenario === s ? "⏳" : `⚡ ${s}`}
            </button>
          ))}
          {state.demo_loaded && (
            <span className="text-xs text-green-700 font-medium px-1">✓ Loaded</span>
          )}
        </div>

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

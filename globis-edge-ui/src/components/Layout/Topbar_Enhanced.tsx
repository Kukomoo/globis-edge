import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { GlossaryPanel } from "../UI/GlossaryPanel";
import { DEMO_SCENARIO_A, DEMO_SCENARIO_B } from "../../data/demoScenario";
import { createSession } from "../../services/api";

export function Topbar_Enhanced() {
  const { state, dispatch } = useSession();
  const [showGlossary, setShowGlossary]     = useState(false);
  const [demoLoading, setDemoLoading]       = useState(false);
  const [activeScenario, setActiveScenario] = useState<"A" | "B">("A");

  const glossaryLanguage = state.ui_language ?? "en";

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
    } catch {
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

  const screenLabels = ["New Intake", "Ingest", "Synthesise", "Explainer", "Dignity Loop", "Commit"];
  const currentLabel = screenLabels[(state.current_screen ?? 1) - 1] ?? "New Intake";

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-4 flex-shrink-0">

        {/* Left: current screen breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-slate-500 flex-shrink-0">
            {String(state.current_screen ?? 1).padStart(2, "0")}/06
          </span>
          <span className="text-slate-200 flex-shrink-0">·</span>
          <span className="text-sm font-semibold text-slate-700 truncate">{currentLabel}</span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 flex-shrink-0" />

        {/* Demo scenario buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium mr-0.5">Demo</span>
          {(["A", "B"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleLoadDemo(s)}
              disabled={demoLoading}
              title={s === "A"
                ? "Scenario A — Hawa Adam: cross-modal conflict"
                : "Scenario B — Yusuf Hassan: auditor block"}
              className={`
                px-2.5 py-1 rounded-md text-xs font-bold transition-all disabled:opacity-50
                ${state.demo_loaded && activeScenario === s
                  ? "bg-green-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-white"
                }
              `}
            >
              {demoLoading && activeScenario === s ? "…" : `⚡ ${s}`}
            </button>
          ))}
          {state.demo_loaded && (
            <span className="text-xs text-green-600 font-medium ml-0.5">✓</span>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5 ml-auto">

          {/* Status pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-500 font-medium flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
            Offline · Demo
          </div>

          {/* Language picker */}
          <select
            aria-label="UI language"
            value={glossaryLanguage}
            onChange={(e) => dispatch({ type: "SET_LANGUAGE", payload: e.target.value })}
            className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600
                       hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500
                       cursor-pointer flex-shrink-0"
          >
            <option value="en">EN · English</option>
            <option value="ar">AR · العربية</option>
            <option value="fr">FR · Français</option>
            <option value="am">AM · አማርኛ</option>
          </select>

          {/* Glossary button */}
          <button
            type="button"
            aria-label="Open glossary"
            onClick={() => setShowGlossary(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600
                       border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300
                       transition-colors flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="flex-shrink-0">
              <rect x="1" y="1" width="10" height="1.5" rx="0.5" fill="currentColor"/>
              <rect x="1" y="4.5" width="10" height="1.5" rx="0.5" fill="currentColor"/>
              <rect x="1" y="8" width="7" height="1.5" rx="0.5" fill="currentColor"/>
            </svg>
            Glossary
          </button>
        </div>
      </header>

      <GlossaryPanel
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
        language={(["en", "ar", "fr"].includes(glossaryLanguage) ? glossaryLanguage : "en") as "en" | "ar" | "fr"}
      />
    </>
  );
}

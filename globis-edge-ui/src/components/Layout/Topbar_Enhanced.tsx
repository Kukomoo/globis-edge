import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { GlossaryPanel } from "../UI/GlossaryPanel";
import { DEMO_SCENARIO_A, DEMO_SCENARIO_B } from "../../data/demoScenario";
import { createSession } from "../../services/api";

interface TopbarProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export function Topbar_Enhanced({ onMenuToggle, sidebarOpen }: TopbarProps) {
  const { state, dispatch } = useSession();
  const [showGlossary, setShowGlossary]   = useState(false);
  const [demoLoading, setDemoLoading]     = useState(false);
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
          scenario,
          site: scenarioData.session.site,
          caseworker_languages: [...scenarioData.session.caseworker_languages],
          beneficiary_languages: [...scenarioData.session.beneficiary_languages],
          artifacts: scenarioData.artifacts.map((a) => ({ ...a })),
          ui_language: "ar",
        },
      });
    } catch {
      dispatch({
        type: "LOAD_DEMO",
        payload: {
          id: "demo-" + Math.random().toString(36).slice(2, 10),
          scenario,
          site: scenarioData.session.site,
          caseworker_languages: [...scenarioData.session.caseworker_languages],
          beneficiary_languages: [...scenarioData.session.beneficiary_languages],
          artifacts: scenarioData.artifacts.map((a) => ({ ...a })),
          ui_language: "ar",
        },
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const screenLabels = ["New Intake", "Documents", "Case Summary", "Explanation", "Confirm", "Save Record"];
  const currentLabel = screenLabels[(state.current_screen ?? 1) - 1] ?? "New Intake";

  return (
    <>
      <header
        className="h-14 flex items-center px-3 sm:px-5 gap-2 sm:gap-4 flex-shrink-0"
        style={{ background: "#ffffff", borderBottom: "1px solid rgba(147,177,194,0.30)" }}
      >
        {/* ── Hamburger (mobile only) ── */}
        <button
          type="button"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
          style={{ color: "#6b7f8c" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(147,177,194,0.12)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
        >
          {sidebarOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          )}
        </button>

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xs font-mono flex-shrink-0" style={{ color: "#9bafba" }}>
            {String(state.current_screen ?? 1).padStart(2, "0")}/06
          </span>
          <span className="flex-shrink-0" style={{ color: "#C4CDD3" }}>·</span>
          <span className="text-sm font-semibold truncate" style={{ color: "#1a2028" }}>{currentLabel}</span>
        </div>

        {/* ── Divider (hidden on very small screens) ── */}
        <div className="hidden sm:block h-5 w-px flex-shrink-0" style={{ background: "rgba(147,177,194,0.35)" }} />

        {/* ── Demo scenario buttons ── */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-medium mr-0.5" style={{ color: "#6b7f8c" }}>Demo</span>
          {(["A", "B"] as const).map((s) => {
            const isActive = state.demo_loaded && state.demo_scenario === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleLoadDemo(s)}
                disabled={demoLoading}
                title={s === "A"
                  ? "Scenario A — Hawa Adam: cross-modal conflict"
                  : "Scenario B — Yusuf Hassan: auditor block"}
                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                style={isActive
                  ? { background: "#93B1C2", color: "#ffffff" }
                  : { background: "#424242", color: "#ffffff" }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "#555555";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = isActive ? "#93B1C2" : "#424242";
                }}
              >
                {demoLoading && activeScenario === s ? "…" : `⚡ ${s}`}
              </button>
            );
          })}
          {state.demo_loaded && (
            <button
              type="button"
              title="Clear demo — start fresh"
              onClick={() => dispatch({ type: "RESET_SESSION" })}
              className="px-2 py-1 rounded-lg text-xs font-medium transition-all ml-0.5"
              style={{ background: "rgba(147,177,194,0.15)", color: "#9bafba", border: "1px solid rgba(147,177,194,0.30)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7f8c"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#9bafba"; }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Mobile demo pill (visible when demo loaded, < sm) ── */}
        {state.demo_loaded && (
          <div
            className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
            style={{ background: "rgba(147,177,194,0.15)", color: "#93B1C2", border: "1px solid rgba(147,177,194,0.30)" }}
          >
            <span>⚡</span>
            <span>{state.demo_scenario ?? "A"}</span>
          </div>
        )}

        {/* ── Right side ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">

          {/* Offline pill — desktop only */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
            style={{ background: "rgba(147,177,194,0.15)", color: "#6b7f8c", border: "1px solid rgba(147,177,194,0.30)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#93B1C2" }} />
            Offline · Demo
          </div>

          {/* Language picker */}
          <select
            aria-label="UI language"
            value={glossaryLanguage}
            onChange={(e) => dispatch({ type: "SET_LANGUAGE", payload: e.target.value })}
            className="px-2 py-1.5 text-xs rounded-lg cursor-pointer flex-shrink-0 focus:outline-none"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(147,177,194,0.40)",
              color: "#3d4d58",
              fontFamily: "var(--font-sans)",
              maxWidth: "7rem",
            }}
          >
            <option value="en">EN</option>
            <option value="ar">AR</option>
            <option value="fr">FR</option>
            <option value="am">AM</option>
          </select>

          {/* Glossary button — icon only on mobile */}
          <button
            type="button"
            aria-label="Open glossary"
            onClick={() => setShowGlossary(true)}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex-shrink-0"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(147,177,194,0.40)",
              color: "#3d4d58",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(147,177,194,0.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="flex-shrink-0">
              <rect x="1" y="1" width="10" height="1.5" rx="0.5" fill="currentColor"/>
              <rect x="1" y="4.5" width="10" height="1.5" rx="0.5" fill="currentColor"/>
              <rect x="1" y="8" width="7" height="1.5" rx="0.5" fill="currentColor"/>
            </svg>
            <span className="hidden sm:inline">Glossary</span>
          </button>
        </div>
      </header>

      {/* ── Mobile bottom demo bar (< sm) ── */}
      <div
        className="flex sm:hidden items-center justify-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ background: "#f7f9fa", borderBottom: "1px solid rgba(147,177,194,0.25)" }}
      >
        <span className="text-xs font-medium" style={{ color: "#6b7f8c" }}>Demo:</span>
        {(["A", "B"] as const).map((s) => {
          const isActive = state.demo_loaded && state.demo_scenario === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleLoadDemo(s)}
              disabled={demoLoading}
              className="px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              style={isActive
                ? { background: "#93B1C2", color: "#ffffff" }
                : { background: "#424242", color: "#ffffff" }}
            >
              {demoLoading && activeScenario === s ? "…" : `⚡ ${s}`}
            </button>
          );
        })}
        {state.demo_loaded && (
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET_SESSION" })}
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ background: "rgba(147,177,194,0.15)", color: "#9bafba", border: "1px solid rgba(147,177,194,0.30)" }}
          >
            ✕
          </button>
        )}
      </div>

      <GlossaryPanel
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
        language={(["en", "ar", "fr", "am"].includes(glossaryLanguage) ? glossaryLanguage : "en") as "en" | "ar" | "fr" | "am"}
      />
    </>
  );
}

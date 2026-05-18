import { useSession } from "../../store/SessionContext";

const screens = [
  { id: 1 as const, label: "New Intake",   step: "01" },
  { id: 2 as const, label: "Ingest",       step: "02" },
  { id: 3 as const, label: "Synthesise",   step: "03" },
  { id: 4 as const, label: "Explainer",    step: "04" },
  { id: 5 as const, label: "Dignity Loop", step: "05" },
  { id: 6 as const, label: "Commit",       step: "06" },
];

export function Sidebar() {
  const { state, dispatch } = useSession();

  return (
    <aside className="w-56 text-white flex flex-col flex-shrink-0" style={{ background: "#1a1714" }}>

      {/* Brand */}
      <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid #2a2520" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#b45309" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#f5f3ef", fontFamily: "var(--font-sans)" }}>Globis Edge</span>
        </div>
        <p className="text-xs ml-9" style={{ color: "#9c9389" }}>v2.0 · Offline mode</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Application steps">
        {screens.map((screen) => {
          const isActive     = state.current_screen === screen.id;
          const isCompleted  = state.current_screen > screen.id;
          const isAccessible = screen.id <= state.current_screen || state.demo_loaded;

          return (
            <button
              key={screen.id}
              type="button"
              onClick={() => isAccessible && dispatch({ type: "SET_SCREEN", payload: screen.id })}
              disabled={!isAccessible}
              aria-current={isActive ? "step" : undefined}
              aria-disabled={!isAccessible ? "true" : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm
                transition-all duration-150 group
                ${isActive
                  ? "text-white shadow-lg"
                  : isCompleted
                    ? "text-slate-300 cursor-pointer"
                    : isAccessible
                      ? "text-slate-500 cursor-pointer"
                      : "text-slate-600 cursor-not-allowed opacity-50"
                }
              `}
              style={
                isActive
                  ? { background: "#b45309" }
                  : isCompleted || isAccessible
                    ? {}
                    : {}
              }
              onMouseEnter={e => {
                if (!isActive && isAccessible) (e.currentTarget as HTMLButtonElement).style.background = "#2a2520";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "";
              }}
            >
              {/* Step badge */}
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                style={
                  isActive
                    ? { background: "rgba(180,83,9,0.3)", color: "#fcd34d" }
                    : isCompleted
                      ? { background: "rgba(180,83,9,0.15)", color: "#fbbf24" }
                      : isAccessible
                        ? { background: "#2a2520", color: "#9c9389" }
                        : { background: "#211e1b", color: "#4a4540" }
                }
              >
                {isCompleted ? "✓" : screen.step}
              </span>

              <span className="font-medium">{screen.label}</span>

              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#fcd34d" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 pt-3 space-y-2" style={{ borderTop: "1px solid #2a2520" }}>
        {state.demo_loaded && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-300 font-medium">Demo active</span>
          </div>
        )}
        <div className="px-1">
          {state.site ? (
            <p className="text-xs text-slate-500 leading-snug truncate" title={state.site}>
              {state.site}
            </p>
          ) : (
            <p className="text-xs text-slate-600 italic">No site selected</p>
          )}
          {state.id && (
            <p className="text-xs font-mono text-slate-700 mt-0.5">
              {state.id.slice(0, 8)}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

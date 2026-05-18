import { useSession } from "../../store/SessionContext";

const screens = [
  { id: 1 as const, label: "New Intake",   step: "01" },
  { id: 2 as const, label: "Documents",    step: "02" },
  { id: 3 as const, label: "Case Summary", step: "03" },
  { id: 4 as const, label: "Explanation",  step: "04" },
  { id: 5 as const, label: "Confirm",      step: "05" },
  { id: 6 as const, label: "Save Record",  step: "06" },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { state, dispatch } = useSession();

  const handleNav = (id: typeof screens[0]["id"], accessible: boolean) => {
    if (!accessible) return;
    dispatch({ type: "SET_SCREEN", payload: id });
    onClose?.(); // close drawer on mobile after nav
  };

  return (
    <aside
      className="w-56 h-full flex flex-col flex-shrink-0"
      style={{ background: "#424242" }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#93B1C2" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5"/>
                <circle cx="7" cy="7" r="2" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
              Globis Edge
            </span>
          </div>
          {/* Mobile close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "rgba(255,255,255,0.50)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ffffff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.50)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        <p className="text-xs mt-1 ml-9" style={{ color: "rgba(255,255,255,0.35)" }}>v2.0 · Offline mode</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto" aria-label="Application steps">
        {screens.map((screen) => {
          const isActive     = state.current_screen === screen.id;
          const isCompleted  = state.current_screen > screen.id;
          const isAccessible = screen.id <= state.current_screen || state.demo_loaded;

          return (
            <button
              key={screen.id}
              type="button"
              onClick={() => handleNav(screen.id, isAccessible)}
              disabled={!isAccessible}
              aria-current={isActive ? "step" : undefined}
              aria-disabled={!isAccessible ? "true" : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-150"
              style={
                isActive
                  ? { background: "#93B1C2", color: "#ffffff" }
                  : isCompleted
                    ? { color: "rgba(255,255,255,0.70)", cursor: "pointer" }
                    : isAccessible
                      ? { color: "rgba(255,255,255,0.50)", cursor: "pointer" }
                      : { color: "rgba(255,255,255,0.25)", cursor: "not-allowed" }
              }
              onMouseEnter={e => {
                if (!isActive && isAccessible) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "";
                }
              }}
            >
              {/* Step badge */}
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                style={
                  isActive
                    ? { background: "rgba(255,255,255,0.20)", color: "#ffffff" }
                    : isCompleted
                      ? { background: "rgba(147,177,194,0.20)", color: "#93B1C2" }
                      : isAccessible
                        ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.40)" }
                        : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.18)" }
                }
              >
                {isCompleted ? "✓" : screen.step}
              </span>

              <span className="font-medium text-sm">{screen.label}</span>

              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.60)" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 pt-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {state.demo_loaded && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "rgba(147,177,194,0.15)", border: "1px solid rgba(147,177,194,0.25)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#93B1C2" }} />
            <span className="text-xs font-medium" style={{ color: "#93B1C2" }}>
              {state.demo_scenario === "B" ? "Demo B · Yusuf" : "Demo A · Hawa"}
            </span>
          </div>
        )}
        <div className="px-1">
          {state.site ? (
            <p className="text-xs leading-snug truncate" style={{ color: "rgba(255,255,255,0.35)" }} title={state.site}>
              {state.site}
            </p>
          ) : (
            <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.20)" }}>No site selected</p>
          )}
          {state.id && (
            <p className="text-xs font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.20)" }}>
              {state.id.slice(0, 8)}
            </p>
          )}
        </div>
        {/* Gemma 4 badge */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(147,177,194,0.10)", border: "1px solid rgba(147,177,194,0.18)" }}
        >
          <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#93B1C2" }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <circle cx="4" cy="4" r="2.8" stroke="white" strokeWidth="1"/>
              <circle cx="4" cy="4" r="1.2" fill="white"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "#93B1C2" }}>
              Gemma 4 · E2B + E4B
            </p>
            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              Pi 5 · Offline · Apache 2.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

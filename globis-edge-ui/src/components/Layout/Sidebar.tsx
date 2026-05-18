import { useSession } from "../../store/SessionContext";

const screens = [
  { id: 1 as const, label: "New Intake",   icon: "🏕️",  short: "Intake"  },
  { id: 2 as const, label: "Ingest",        icon: "📎",  short: "Ingest"  },
  { id: 3 as const, label: "Synthesise",    icon: "🧩",  short: "Synth"   },
  { id: 4 as const, label: "Explainer",     icon: "🔍",  short: "Explain" },
  { id: 5 as const, label: "Dignity Loop",  icon: "🔊",  short: "Dignity" },
  { id: 6 as const, label: "Commit",        icon: "💾",  short: "Commit"  },
];

export function Sidebar() {
  const { state, dispatch } = useSession();

  return (
    <aside className="w-52 bg-slate-900 text-white flex flex-col">
      {/* Logo / brand */}
      <div className="px-5 py-5 border-b border-slate-700">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Globis Edge</p>
        <p className="text-xs text-slate-500">v2.0 · Offline mode</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {screens.map((screen) => {
          const isActive = state.current_screen === screen.id;
          const isCompleted = state.current_screen > screen.id;
          const isAccessible = screen.id <= state.current_screen || state.demo_loaded;

          return (
            <button
              key={screen.id}
              onClick={() => isAccessible && dispatch({ type: "SET_SCREEN", payload: screen.id })}
              disabled={!isAccessible}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all
                ${isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : isCompleted
                    ? "text-slate-300 hover:bg-slate-800 cursor-pointer"
                    : isAccessible
                      ? "text-slate-400 hover:bg-slate-800 cursor-pointer"
                      : "text-slate-600 cursor-not-allowed"
                }`}
            >
              <span className="text-base w-5 flex-shrink-0">{screen.icon}</span>
              <span className="font-medium truncate">{screen.label}</span>
              {isCompleted && !isActive && (
                <span className="ml-auto text-green-400 text-xs">✓</span>
              )}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Session info footer */}
      <div className="px-4 py-4 border-t border-slate-700 space-y-2">
        {state.demo_loaded && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-900/40 rounded-md">
            <span className="text-amber-400 text-xs">⚡</span>
            <span className="text-xs text-amber-300 font-medium">Demo active</span>
          </div>
        )}
        <div className="px-2">
          <p className="text-xs text-slate-500 mb-0.5">
            {state.site ? state.site.split("—")[0].trim() : "No site selected"}
          </p>
          {state.id && (
            <p className="text-xs font-mono text-slate-600">
              {state.id.slice(0, 8)}…
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

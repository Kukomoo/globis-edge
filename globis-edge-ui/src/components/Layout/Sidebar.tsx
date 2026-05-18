import { useSession } from "../../store/SessionContext";

export function Sidebar() {
  const { state, dispatch } = useSession();

  const screens = [
    { id: 1 as const, label: "New", icon: "+" },
    { id: 2 as const, label: "Ingest", icon: "📎" },
    { id: 3 as const, label: "Synth", icon: "✓" },
    { id: 4 as const, label: "Expln", icon: "📝" },
    { id: 5 as const, label: "Dgnty", icon: "🔊" },
    { id: 6 as const, label: "Commt", icon: "💾" },
  ];

  return (
    <aside className="w-48 bg-gray-900 text-white flex flex-col p-4 gap-2">
      {screens.map((screen) => (
        <button
          key={screen.id}
          onClick={() => dispatch({ type: "SET_SCREEN", payload: screen.id })}
          className={`p-3 rounded text-left text-sm transition ${
            state.current_screen === screen.id
              ? "bg-blue-600"
              : "hover:bg-gray-800"
          }`}
        >
          <span className="mr-2">{screen.icon}</span>
          {screen.id}. {screen.label}
        </button>
      ))}
    </aside>
  );
}

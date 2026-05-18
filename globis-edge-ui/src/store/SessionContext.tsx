import { createContext, useContext, useReducer, type ReactNode } from "react";

export interface SessionState {
  id: string | null;
  site: string | null;
  caseworker_languages: string[];
  beneficiary_languages: string[];
  artifacts: any[];
  dossier: any | null;
  current_screen: 1 | 2 | 3 | 4 | 5 | 6;
  ui_language: "en" | "ar" | "fr" | "am";
  /** True after "Load Demo" has been triggered */
  demo_loaded: boolean;
  /** Which demo scenario is currently loaded — "A" (Hawa) or "B" (Yusuf) */
  demo_scenario: "A" | "B" | null;
}

const initialState: SessionState = {
  id: null,
  site: null,
  caseworker_languages: [],
  beneficiary_languages: [],
  artifacts: [],
  dossier: null,
  current_screen: 1,
  ui_language: "en",
  demo_loaded: false,
  demo_scenario: null,
};

interface SessionContextType {
  state: SessionState;
  dispatch: React.Dispatch<any>;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used in SessionProvider");
  return ctx;
}

function sessionReducer(state: SessionState, action: any): SessionState {
  switch (action.type) {
    case "CREATE_SESSION":
      return { ...state, id: action.payload.id, ...action.payload };
    case "ADD_ARTIFACT":
      return { ...state, artifacts: [...state.artifacts, action.payload] };
    case "SET_DOSSIER":
      return { ...state, dossier: action.payload };
    case "SET_SCREEN":
      return { ...state, current_screen: action.payload };
    case "SET_LANGUAGE":
      return { ...state, ui_language: action.payload as SessionState["ui_language"] };
    case "LOAD_DEMO":
      return {
        ...state,
        id: action.payload.id,
        site: action.payload.site,
        caseworker_languages: action.payload.caseworker_languages,
        beneficiary_languages: action.payload.beneficiary_languages,
        artifacts: action.payload.artifacts,
        ui_language: action.payload.ui_language ?? "ar",
        demo_loaded: true,
        demo_scenario: action.payload.scenario ?? "A",
        dossier: null,
        current_screen: 2,
      };
    case "RESET_SESSION":
      return { ...initialState };
    default:
      return state;
  }
}

import { createContext, useContext, useReducer, type ReactNode } from "react";

export interface SessionState {
  id: string | null;
  site: string | null;
  caseworker_languages: string[];
  beneficiary_languages: string[];
  artifacts: any[];
  dossier: any | null;
  current_screen: 1 | 2 | 3 | 4 | 5 | 6;
}

const initialState: SessionState = {
  id: null,
  site: null,
  caseworker_languages: [],
  beneficiary_languages: [],
  artifacts: [],
  dossier: null,
  current_screen: 1,
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
    default:
      return state;
  }
}

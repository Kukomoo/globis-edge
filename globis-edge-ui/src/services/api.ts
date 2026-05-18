import axios from "axios";

// When served from the Pi hotspot the page origin is http://192.168.50.1:8080,
// so we derive the API base from window.location.origin.  In Vite dev mode the
// page is on localhost:5173 and the API is on localhost:8080, so we fall back
// to localhost:8080 only in that case.
const _isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const _BASE = _isDev ? "http://localhost:8080" : window.location.origin;

const api = axios.create({
  baseURL: _BASE,
  timeout: 30000,
});

export const createSession = async (data: any) =>
  api.post("/new-session", data);

export const uploadArtifact = async (formData: FormData) =>
  api.post("/intake", formData);

export const synthesise = async (session_id: string) =>
  api.post("/synthesise", { session_id });

export const generateExplainer = async (session_id: string, language: string) =>
  api.post("/generate-explainer", { session_id, language });

export const generateTTS = async (session_id: string, language: string) =>
  api.post("/generate-tts", { session_id, language });

export const commitRecord = async (data: any) =>
  api.post("/commit", data);

export const checkHealth = async () =>
  api.get("/health");

export const translateGlossaryTerm = async (data: {
  term_id: string;
  term_en: string;
  definition_en: string;
  target_language: string;
}) => api.post("/translate-glossary", data);

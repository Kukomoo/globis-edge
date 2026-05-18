import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
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

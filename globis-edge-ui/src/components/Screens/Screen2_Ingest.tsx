import { useState, useRef } from "react";
import { useSession } from "../../store/SessionContext";
import { uploadArtifact } from "../../services/api";

export function Screen2_Ingest() {
  const { state, dispatch } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"photo" | "audio" | "text">("photo");
  const [textNotes, setTextNotes] = useState("");
  const [textSaved, setTextSaved] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    modality: string
  ) => {
    const file = e.target.files?.[0];
    if (!file || !state.id) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("session_id", state.id);
      formData.append("modality", modality);
      formData.append("file", file);

      const response = await uploadArtifact(formData);
      dispatch({
        type: "ADD_ARTIFACT",
        payload: { modality, filename: file.name, ...response.data },
      });
    } catch (err: any) {
      setError(err.message || "Failed to upload artifact");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = () => {
    if (!textNotes.trim()) return;
    dispatch({
      type: "ADD_ARTIFACT",
      payload: {
        modality: "text",
        filename: "caseworker_notes.txt",
        label: "Caseworker Notes",
        text: textNotes.trim(),
        icon: "📝",
        preview: textNotes.trim().slice(0, 120) + (textNotes.length > 120 ? "…" : ""),
        ingested_at: new Date().toISOString(),
      },
    });
    setTextSaved(true);
    setTextNotes("");
  };

  const canProceed = state.artifacts.length > 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Ingest Artifacts</h1>
      <p className="text-gray-600 mb-6">
        Upload documents, audio, and notes for {state.site}
      </p>

      {/* ── Demo pre-load banner ─────────────────────────────────── */}
      {state.demo_loaded && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <p className="font-semibold text-amber-900">Demo Scenario Pre-loaded — Yusuf Ahmed Hassan</p>
          </div>
          <p className="text-sm text-amber-800 mb-3">
            Three synthetic artifacts have been injected below: a national ID photo (OCR), an Arabic audio
            testimony (transcribed by Scout E2B in 820ms), and caseworker notes. In the field, each would
            be captured or uploaded in real time.
          </p>
          <p className="text-xs text-amber-700 italic">
            All data is synthetic and watermarked. No real personal data is used.
          </p>
        </div>
      )}

      {/* ── Artifact preview cards (demo mode) ─────────────────────── */}
      {state.demo_loaded && state.artifacts.length > 0 && (
        <div className="space-y-4 mb-8">
          {state.artifacts.map((artifact: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{artifact.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{artifact.label}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      ✓ Loaded
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-2">{artifact.filename}</p>
                  {artifact.preview && (
                    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                        {artifact.modality === "image" ? "OCR Extract" :
                         artifact.modality === "audio" ? "Transcript (Scout E2B)" : "Caseworker Notes"}
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed italic">
                        "{artifact.preview}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Manual upload tabs (non-demo or additional uploads) ────── */}
      {!state.demo_loaded && (
        <>
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            {(["photo", "audio", "text"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                {tab === "photo"
                  ? "📷 ID Photo"
                  : tab === "audio"
                    ? "🎤 Audio"
                    : "📝 Text Notes"}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {activeTab === "photo" && (
              <div className="space-y-4">
                <p className="text-gray-600">Upload ID document photo for OCR</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "image")}
                  disabled={loading}
                  className="block w-full"
                />
              </div>
            )}

            {activeTab === "audio" && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Upload audio testimony for transcription
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, "audio")}
                  disabled={loading}
                  className="block w-full"
                />
              </div>
            )}

            {activeTab === "text" && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Enter intake notes and observations
                </p>
                <textarea
                  ref={textAreaRef}
                  value={textNotes}
                  onChange={(e) => { setTextNotes(e.target.value); setTextSaved(false); }}
                  placeholder="E.g. Arrived via informal group, mother alert and responsive, child appears healthy..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                />
                {textSaved && (
                  <p className="text-sm text-green-600 font-medium">✓ Notes saved as artifact</p>
                )}
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={!textNotes.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save Notes
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-gray-700 mb-4">Uploaded Artifacts</h3>
            <div className="space-y-2">
              {state.artifacts.length === 0 ? (
                <p className="text-gray-500">No artifacts uploaded yet</p>
              ) : (
                state.artifacts.map((artifact: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                    <span className="text-lg">
                      {artifact.modality === "image"
                        ? "📷"
                        : artifact.modality === "audio"
                          ? "🎤"
                          : "📝"}
                    </span>
                    <span className="text-sm text-gray-700">{artifact.filename}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 1 })}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 3 })}
          disabled={loading || !canProceed}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Continue to Synthesis →"}
        </button>
      </div>
    </div>
  );
}

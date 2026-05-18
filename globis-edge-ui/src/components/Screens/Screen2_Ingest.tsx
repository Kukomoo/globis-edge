import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { uploadArtifact } from "../../services/api";

export function Screen2_Ingest() {
  const { state, dispatch } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"photo" | "audio" | "text">(
    "photo"
  );

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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Ingest Artifacts</h1>
      <p className="text-gray-600 mb-6">
        Upload documents, audio, and notes for {state.site}
      </p>

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
              placeholder="Caseworker notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
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
            state.artifacts.map((artifact, idx) => (
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

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 1 })}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 3 })}
          disabled={loading || state.artifacts.length === 0}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Continue to Synthesis"}
        </button>
      </div>
    </div>
  );
}

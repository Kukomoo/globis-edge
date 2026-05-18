import { useState, useEffect } from "react";
import { useSession } from "../../store/SessionContext";
import { generateTTS } from "../../services/api";

export function Screen5_DignityLoop() {
  const { state, dispatch } = useSession();
  const [ttsResult, setTtsResult] = useState<{
    audio_url: string | null;
    text: string;
    tts_engine: string;
    audio_note?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [confirmed, setConfirmed] = useState({
    heard: false,
    correct: false,
    consent: false,
  });

  useEffect(() => {
    if (!ttsResult && state.id) {
      handleGenerateTTS();
    }
  }, []);

  const handleGenerateTTS = async () => {
    if (!state.id) return;
    setLoading(true);
    try {
      const response = await generateTTS(state.id, language);
      setTtsResult(response.data);
    } catch (err) {
      console.error("Failed to generate TTS", err);
    } finally {
      setLoading(false);
    }
  };

  const allConfirmed = confirmed.heard && confirmed.correct && confirmed.consent;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Dignity Loop Confirmation</h1>
      <p className="text-gray-600 mb-8">
        Read or play the summary to the beneficiary in their language, then confirm their understanding.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <h2 className="font-bold text-lg mb-4">Summary Playback</h2>

        <div className="mb-6 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setTtsResult(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="en">English</option>
              <option value="ar">Arabic (العربية)</option>
              <option value="fr">French (Français)</option>
              <option value="am">Amharic (አማርኛ)</option>
            </select>
          </div>
          <button
            onClick={handleGenerateTTS}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "↻ Refresh"}
          </button>
        </div>

        {loading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 mb-4">
            Generating summary...
          </div>
        )}

        {ttsResult && (
          <>
            {/* Text summary — always visible */}
            <div className="bg-gray-50 rounded-lg p-6 mb-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📋</span>
                <p className="text-sm font-medium text-gray-700">
                  Summary — read aloud to beneficiary
                </p>
              </div>
              <p className="text-base leading-relaxed text-gray-900">
                {ttsResult.text}
              </p>
            </div>

            {/* Audio player if available, otherwise Piper TTS note */}
            {ttsResult.audio_url ? (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <audio src={ttsResult.audio_url} controls className="w-full" />
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  🔊 Piper TTS — on-device only (Raspberry Pi 5)
                </p>
                <p className="text-xs text-amber-800">
                  {ttsResult.audio_note ||
                    "Audio playback requires Piper TTS installed on the Pi 5. In the field, this plays spoken audio in the beneficiary's language directly through the device speaker."}
                </p>
              </div>
            )}

            <div className="text-xs text-gray-500 mb-2">
              Engine: {ttsResult.tts_engine}
            </div>
          </>
        )}

        {/* Confirmation checklist */}
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900">Caseworker Confirmation</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed.heard}
                onChange={(e) => setConfirmed({ ...confirmed, heard: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Beneficiary heard (or read) the summary
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed.correct}
                onChange={(e) => setConfirmed({ ...confirmed, correct: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Beneficiary confirmed the information is correct
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed.consent}
                onChange={(e) => setConfirmed({ ...confirmed, consent: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Beneficiary consents to the record being saved
              </span>
            </label>
          </div>

          {allConfirmed && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✅ Dignity Loop complete. You may now proceed to commit.
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 4 })}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 6 })}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Continue to Commit
        </button>
      </div>
    </div>
  );
}

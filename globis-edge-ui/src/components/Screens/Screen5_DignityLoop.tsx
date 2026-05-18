import { useState, useEffect } from "react";
import { useSession } from "../../store/SessionContext";
import { generateTTS } from "../../services/api";
import { DEMO_SCENARIO } from "../../data/demoScenario";

export function Screen5_DignityLoop() {
  const { state, dispatch } = useSession();
  const [ttsResult, setTtsResult] = useState<{
    audio_url: string | null;
    text: string;
    tts_engine: string;
    audio_note?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const language = state.ui_language ?? "en";
  const [confirmed, setConfirmed] = useState({ heard: false, correct: false, consent: false });

  useEffect(() => {
    if (state.id) { setTtsResult(null); handleGenerateTTS(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleGenerateTTS = async () => {
    if (!state.id) return;
    setLoading(true);
    try {
      const response = await generateTTS(state.id, language);
      setTtsResult(response.data);
    } catch (err) {
      console.error("TTS failed", err);
    } finally {
      setLoading(false);
    }
  };

  const allConfirmed = confirmed.heard && confirmed.correct && confirmed.consent;
  const isRTL = language === "ar";

  const demoFallbackText = state.demo_loaded
    ? (DEMO_SCENARIO.dignityText as Record<string, string>)[language] || DEMO_SCENARIO.dignityText.en
    : null;
  const displayText = ttsResult?.text ?? demoFallbackText;

  const langLabels: Record<string, string> = {
    en: "English", ar: "العربية", fr: "Français", am: "አማርኛ",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dignity Loop</h1>
        <p className="text-sm text-slate-500 mt-1">
          Read or play the summary to the beneficiary in their language, then confirm understanding.
        </p>
      </div>

      {/* Language + refresh */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor="beneficiary-language" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Beneficiary Language
          </label>
          <select
            id="beneficiary-language"
            value={language}
            onChange={(e) => dispatch({ type: "SET_LANGUAGE", payload: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="am">🇪🇹 አማርኛ</option>
          </select>
        </div>
        <div className="pt-6">
          <button
            type="button"
            onClick={handleGenerateTTS}
            disabled={loading}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl
                       hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />Generating…</>
              : "↻ Refresh"
            }
          </button>
        </div>
      </div>

      {/* Summary text card */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Summary — {langLabels[language] ?? language}</p>
            <p className="text-xs text-slate-500 mt-0.5">Read this aloud to the beneficiary</p>
          </div>
          {state.demo_loaded && !ttsResult && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
              ⚡ Demo text
            </span>
          )}
        </div>

        <div className="p-5">
          {loading && !displayText && (
            <div className="flex items-center gap-2 text-sm text-blue-700 py-4">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Generating summary in {langLabels[language] ?? language}…
            </div>
          )}

          {displayText && (
            <div className={`
              p-5 bg-slate-50 rounded-xl border border-slate-100 text-base leading-relaxed text-slate-900
              ${isRTL ? "text-right" : "text-left"}
            `}
              dir={isRTL ? "rtl" : "ltr"}
            >
              {displayText}
            </div>
          )}

          {/* Audio */}
          <div className="mt-4">
            {ttsResult?.audio_url ? (
              <audio src={ttsResult.audio_url} controls className="w-full h-10 rounded-lg" />
            ) : (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-amber-500 flex-shrink-0">🔊</span>
                <div>
                  <p className="text-xs font-semibold text-amber-900 mb-0.5">Piper TTS — on-device only</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {ttsResult?.audio_note ||
                      "Audio playback requires Piper TTS on the Pi 5. In the field, this plays spoken audio in the beneficiary's language through the device speaker."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {ttsResult?.tts_engine && (
            <p className="mt-2 text-xs text-slate-500 font-mono">Engine: {ttsResult.tts_engine}</p>
          )}
        </div>
      </div>

      {/* Confirmation checklist */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Caseworker Confirmation</p>
          <p className="text-xs text-slate-500 mt-0.5">Tick all three before proceeding</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            { key: "heard"   as const, label: "Beneficiary heard (or read) the summary" },
            { key: "correct" as const, label: "Beneficiary confirmed the information is correct" },
            { key: "consent" as const, label: "Beneficiary consents to the record being saved" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className={`
                flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors
                ${confirmed[key]
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              <div className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${confirmed[key] ? "bg-green-500 border-green-500" : "border-slate-300"}
              `}>
                {confirmed[key] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={confirmed[key]}
                onChange={(e) => setConfirmed({ ...confirmed, [key]: e.target.checked })}
                className="sr-only"
              />
              <span className={`text-sm ${confirmed[key] ? "text-green-900 font-medium" : "text-slate-700"}`}>
                {label}
              </span>
            </label>
          ))}

          {allConfirmed && (
            <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl mt-2">
              <span className="text-lg">✅</span>
              <p className="text-sm font-semibold text-green-800">Dignity Loop complete — ready to commit</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 4 })}
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors"
        >
          ← Back to Explainer
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 6 })}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          Continue to Commit →
        </button>
      </div>
    </div>
  );
}

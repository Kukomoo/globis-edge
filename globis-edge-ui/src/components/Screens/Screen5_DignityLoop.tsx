import { useState, useEffect, useRef } from "react";
import { useSession } from "../../store/SessionContext";
import { generateTTS } from "../../services/api";
import { DEMO_SCENARIO } from "../../data/demoScenario";
import { t } from "../../data/translations";

// Map UI language codes to BCP-47 tags for Web Speech API
const SPEECH_LANG: Record<string, string> = {
  en: "en-US",
  ar: "ar-SA",
  fr: "fr-FR",
  am: "am-ET",
};

export function Screen5_DignityLoop() {
  const { state, dispatch } = useSession();
  const [ttsResult, setTtsResult] = useState<{
    audio_url: string | null;
    text: string;
    tts_engine: string;
    audio_note?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const language = state.ui_language ?? "en";
  const [confirmed, setConfirmed] = useState({ heard: false, correct: false, consent: false });

  useEffect(() => {
    if (state.id) { setTtsResult(null); handleGenerateTTS(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Cancel speech synthesis when component unmounts (user navigates to another screen)
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  // Web Speech API fallback — speaks the displayed text on the device speaker
  const handleSpeak = () => {
    const text = displayText;
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG[language] ?? "en-US";
    utterance.rate = 0.9;
    utterance.onstart  = () => setSpeaking(true);
    utterance.onend    = () => setSpeaking(false);
    utterance.onerror  = () => setSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
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
    <div className="space-y-5 sm:space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1a2028]">{t(language, "confirmWithPerson")}</h1>
        <p className="text-sm text-[#6b7f8c] mt-1">{t(language, "confirmWithPersonSubtitle")}</p>
      </div>

      {/* Language + refresh */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor="beneficiary-language" className="block text-xs font-semibold text-[#6b7f8c] uppercase tracking-wide mb-1.5">
            {t(language, "beneficiaryLanguage")}
          </label>
          <select
            id="beneficiary-language"
            value={language}
            onChange={(e) => dispatch({ type: "SET_LANGUAGE", payload: e.target.value })}
            className="w-full px-3 py-2.5 border border-[rgba(147,177,194,0.35)] rounded-xl text-sm text-[#3d4d58]
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
            className="px-4 py-2.5 border border-[rgba(147,177,194,0.35)] text-[#3d4d58] text-sm font-medium rounded-xl
                       hover:bg-[#f0f5f8] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-[#93B1C2] border-t-transparent rounded-full animate-spin" />{t(language, "generating")}</>
              : t(language, "refresh")
            }
          </button>
        </div>
      </div>

      {/* Summary text card */}
      <div className="rounded-xl border border-[rgba(147,177,194,0.35)] bg-white overflow-hidden">
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[rgba(147,177,194,0.35)] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a2028]">Summary — {langLabels[language] ?? language}</p>
            <p className="text-xs text-[#6b7f8c] mt-0.5">{t(language, "readAloud")}</p>
          </div>
          {state.demo_loaded && !ttsResult && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
              ⚡ Demo text
            </span>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {loading && !displayText && (
            <div className="flex items-center gap-2 text-sm text-blue-700 py-4">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              {t(language, "generating")} {langLabels[language] ?? language}…
            </div>
          )}

          {displayText && (
            <div className={`
              p-5 bg-[#f7f9fa] rounded-xl border border-[rgba(147,177,194,0.35)] text-base leading-relaxed text-[#1a2028]
              ${isRTL ? "text-right" : "text-left"}
            `}
              dir={isRTL ? "rtl" : "ltr"}
            >
              {displayText}
            </div>
          )}

          {/* Audio — Piper .wav if available, Web Speech API otherwise */}
          <div className="mt-4">
            {ttsResult?.audio_url ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#6b7f8c]">Play audio for beneficiary</p>
                <audio src={ttsResult.audio_url} controls className="w-full h-10 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#6b7f8c]">Play summary aloud</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={speaking ? handleStopSpeech : handleSpeak}
                    disabled={!displayText}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                      ${speaking
                        ? "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                        : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-[#D5DEE3] disabled:text-[#9bafba]"
                      }`}
                  >
                    {speaking ? (
                      <><span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />{t(language, "stopPlayback")}</>
                    ) : (
                      <><span>🔊</span>{t(language, "playInLanguage")}</>
                    )}
                  </button>
                  {speaking && (
                    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs text-blue-700 font-medium">Speaking…</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#9bafba]">
                  Uses your device's built-in voice. On the Pi in the field, Piper TTS provides a higher-quality voice.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation checklist */}
      <div className="rounded-xl border border-[rgba(147,177,194,0.35)] bg-white overflow-hidden">
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[rgba(147,177,194,0.35)]">
          <p className="text-sm font-semibold text-[#1a2028]">{t(language, "yourConfirmation")}</p>
          <p className="text-xs text-[#6b7f8c] mt-0.5">{t(language, "tickAll")}</p>
        </div>
        <div className="p-4 sm:p-6 space-y-3">
          {[
            { key: "heard"   as const, label: t(language, "heard") },
            { key: "correct" as const, label: t(language, "correct") },
            { key: "consent" as const, label: t(language, "consent") },
          ].map(({ key, label }) => (
            <label
              key={key}
              className={`
                flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors
                ${confirmed[key]
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-[rgba(147,177,194,0.35)] hover:bg-[#f7f9fa]"
                }
              `}
            >
              <div className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${confirmed[key] ? "bg-green-500 border-green-500" : "border-[rgba(147,177,194,0.5)]"}
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
              <span className={`text-sm ${confirmed[key] ? "text-green-900 font-medium" : "text-[#1a2028]"}`}>
                {label}
              </span>
            </label>
          ))}

          {allConfirmed && (
            <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl mt-2">
              <span className="text-lg">✅</span>
              <p className="text-sm font-semibold text-green-800">{t(language, "confirmedReady")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-[rgba(147,177,194,0.35)] mt-2" />
      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 4 })}
          className="flex-1 px-4 py-3 border border-[rgba(147,177,194,0.35)] rounded-xl font-medium text-sm text-[#3d4d58] hover:bg-[#f0f5f8] transition-colors"
        >
          {t(language, "backToExplainer")}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 6 })}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          {t(language, "saveRecord")}
        </button>
      </div>
    </div>
  );
}

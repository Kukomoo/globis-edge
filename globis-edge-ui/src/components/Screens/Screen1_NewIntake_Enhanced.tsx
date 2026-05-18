import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { createSession } from "../../services/api";

const LANGUAGES = [
  { code: "en",  label: "English",  flag: "🇬🇧", minority: false },
  { code: "ar",  label: "Arabic",   flag: "🇸🇦", minority: false },
  { code: "fr",  label: "French",   flag: "🇫🇷", minority: false },
  { code: "am",  label: "Amharic",  flag: "🇪🇹", minority: false },
  { code: "ti",  label: "Tigrinya", flag: "🇪🇷", minority: false },
  { code: "mas", label: "Masalit",  flag: "🌍", minority: true,  warning: "No ASR — route to interpreter" },
  { code: "fur", label: "Fur",      flag: "🌍", minority: true,  warning: "No ASR — route to interpreter" },
  { code: "zag", label: "Zaghawa", flag: "🌍", minority: true,  warning: "No ASR — route to interpreter" },
];

function LangToggle({
  lang,
  selected,
  onToggle,
  showWarning = false,
}: {
  lang: typeof LANGUAGES[0];
  selected: boolean;
  onToggle: () => void;
  showWarning?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        border transition-all duration-100 select-none
        ${selected
          ? lang.minority
            ? "bg-orange-100 border-orange-400 text-orange-900"
            : "bg-blue-600 border-blue-600 text-white shadow-sm"
          : lang.minority
            ? "bg-white border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-700"
            : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50"
        }
      `}
    >
      <span className="text-base leading-none">{lang.flag}</span>
      <span>{lang.label}</span>
      {lang.minority && showWarning && (
        <span className="text-orange-500 text-xs ml-0.5">⚠</span>
      )}
      {selected && !lang.minority && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-0.5">
          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

export function Screen1_NewIntake() {
  const { state, dispatch } = useSession();
  const [formData, setFormData] = useState({
    site: "",
    caseworker_languages: ["en"] as string[],
    beneficiary_languages: [] as string[],
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const displaySite = state.demo_loaded ? (state.site ?? formData.site) : formData.site;

  const toggleLang = (field: "caseworker_languages" | "beneficiary_languages", code: string) => {
    const current = formData[field];
    setFormData({
      ...formData,
      [field]: current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    });
  };

  const minorityWarning = formData.beneficiary_languages
    .map((c) => LANGUAGES.find((l) => l.code === c))
    .find((l) => l?.minority);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.demo_loaded && state.id) {
      dispatch({ type: "SET_SCREEN", payload: 2 });
      return;
    }
    if (!formData.site || formData.beneficiary_languages.length === 0) {
      setError("Please enter a reception site and select at least one beneficiary language.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await createSession(formData);
      dispatch({ type: "CREATE_SESSION", payload: response.data });
      dispatch({ type: "SET_SCREEN", payload: 2 });
    } catch (err: any) {
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div>

        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">New Intake</h1>
          <p className="text-slate-500 text-sm">
            Register a new beneficiary arrival at your reception site
          </p>
        </div>

        {/* Demo active banner */}
        {state.demo_loaded && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-amber-500 text-lg flex-shrink-0">⚡</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Demo scenario loaded</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Session is pre-filled. Click <strong>Continue to Ingest</strong> to see the artifacts.
              </p>
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <form onSubmit={handleSubmit}>
            <div className="p-7 space-y-7">

              {/* Reception site */}
              <div>
                <label htmlFor="site" className="block text-sm font-semibold text-slate-700 mb-2">
                  Reception Site
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  id="site"
                  type="text"
                  value={displaySite}
                  readOnly={state.demo_loaded}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder="e.g., Adré reception point — Tent 4"
                  className={`
                    w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900
                    placeholder-slate-400 transition-shadow
                    ${state.demo_loaded
                      ? "bg-slate-50 text-slate-500 cursor-not-allowed"
                      : "bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }
                  `}
                  required={!state.demo_loaded}
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Recorded in the audit trail for this session.
                </p>
              </div>

              {/* Caseworker languages */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Caseworker Languages
                </label>
                <p className="text-xs text-slate-500 mb-3">Languages the caseworker speaks</p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <LangToggle
                      key={lang.code}
                      lang={lang}
                      selected={formData.caseworker_languages.includes(lang.code)}
                      onToggle={() => toggleLang("caseworker_languages", lang.code)}
                    />
                  ))}
                </div>
              </div>

              {/* Beneficiary languages */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Beneficiary Languages
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">Languages the arriving person speaks</p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <LangToggle
                      key={lang.code}
                      lang={lang}
                      selected={formData.beneficiary_languages.includes(lang.code)}
                      onToggle={() => toggleLang("beneficiary_languages", lang.code)}
                      showWarning
                    />
                  ))}
                </div>
              </div>

              {/* Minority language warning */}
              {minorityWarning && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500 text-lg flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-900 mb-1">Dialect Alert — {minorityWarning.label}</p>
                      <p className="text-sm text-orange-800 mb-3">{minorityWarning.warning}</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          onClick={() => alert("Interpreter roster: Call José (Masalit) or Fatima (Fur).")}
                        >
                          📞 Call Interpreter
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-medium bg-white border border-orange-200 text-orange-800 rounded-lg hover:bg-orange-50 transition-colors"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              beneficiary_languages: formData.beneficiary_languages.filter(
                                (c) => !LANGUAGES.find((l) => l.code === c)?.minority
                              ),
                            })
                          }
                        >
                          Clear minority language
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer with CTA */}
            <div className="px-7 py-5 bg-slate-50 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm
                           hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500
                           transition-colors shadow-sm"
              >
                {loading ? "Creating session…" : "Continue to Ingest →"}
              </button>
            </div>
          </form>
        </div>

        {/* Caseworker context note */}
        <div className="mt-5 px-5 py-4 rounded-xl border border-slate-200 bg-white/60 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="text-slate-500 text-base flex-shrink-0">💡</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-600">You are a frontline protection worker.</strong>{" "}
              This system helps you quickly ingest documents, audio, and notes — then surfaces
              any discrepancies so you can make an informed decision.{" "}
              <strong className="text-slate-600">You always decide; the system never denies.</strong>
            </p>
          </div>
        </div>

    </div>
  );
}

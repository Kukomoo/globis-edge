import { useState } from "react";
import { useSession } from "../../store/SessionContext";
import { createSession } from "../../services/api";

export function Screen1_NewIntake() {
  const { dispatch } = useSession();
  const [formData, setFormData] = useState({
    site: "",
    caseworker_languages: ["en"] as string[],
    beneficiary_languages: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { code: "en", label: "English", isMinority: false },
    { code: "ar", label: "Arabic", isMinority: false },
    { code: "fr", label: "French", isMinority: false },
    { code: "am", label: "Amharic", isMinority: false },
    { code: "ti", label: "Tigrinya", isMinority: false },
    { code: "mas", label: "Masalit", isMinority: true, warning: "No ASR support — route to interpreter" },
    { code: "fur", label: "Fur", isMinority: true, warning: "No ASR support — route to interpreter" },
    { code: "zag", label: "Zaghawa", isMinority: true, warning: "No ASR support — route to interpreter" },
  ];

  // Check if any selected language is a minority language without support
  const hasMinorityLanguageSelected = formData.beneficiary_languages.some((lang) => {
    const langObj = languages.find((l) => l.code === lang);
    return langObj?.isMinority;
  });

  const getWarningMessage = () => {
    const minorityLangs = formData.beneficiary_languages
      .map((lang) => languages.find((l) => l.code === lang))
      .filter((lang) => lang?.isMinority);

    if (minorityLangs.length === 0) return null;

    return minorityLangs[0]?.warning || "Minority language selected";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.site || formData.beneficiary_languages.length === 0) {
      setError("Please fill in all required fields");
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
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Start a New Intake</h1>
      <p className="text-gray-600 mb-8">Register a new beneficiary case</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reception Site *
          </label>
          <input
            type="text"
            value={formData.site}
            onChange={(e) =>
              setFormData({ ...formData, site: e.target.value })
            }
            placeholder="e.g., Adré reception point — Tent 4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps the audit trail know where the intake happened.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caseworker Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <label key={lang.code} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.caseworker_languages.includes(lang.code)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        caseworker_languages: [
                          ...formData.caseworker_languages,
                          lang.code,
                        ],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        caseworker_languages:
                          formData.caseworker_languages.filter(
                            (l) => l !== lang.code
                          ),
                      });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">{lang.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beneficiary Languages *
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <label key={lang.code} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.beneficiary_languages.includes(lang.code)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        beneficiary_languages: [
                          ...formData.beneficiary_languages,
                          lang.code,
                        ],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        beneficiary_languages:
                          formData.beneficiary_languages.filter(
                            (l) => l !== lang.code
                          ),
                      });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  {lang.label}
                  {lang.isMinority && (
                    <span className="ml-1 text-xs text-orange-600">(minority)</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* DIALECT ALERT - NEW */}
        {hasMinorityLanguageSelected && (
          <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
            <p className="text-sm font-bold text-orange-900 mb-2">⚠️ Dialect Alert</p>
            <p className="text-sm text-orange-800 mb-3">
              {getWarningMessage()}
            </p>
            <p className="text-xs text-orange-700">
              <strong>Recommended:</strong> Call your team interpreter before continuing.
              This system cannot reliably process minority languages. A human interpreter
              will provide better service and more accurate intake.
            </p>
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <p className="text-xs font-medium text-gray-900">Quick Actions:</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                  onClick={() => {
                    // In production, this would open an interpreter roster
                    alert(
                      "Interpreter roster would load here. For demo: Call José (Masalit) or Fatima (Fur)."
                    );
                  }}
                >
                  📞 Call Interpreter
                </button>
                <button
                  type="button"
                  className="text-xs bg-gray-300 text-gray-900 px-3 py-1 rounded hover:bg-gray-400"
                  onClick={() => {
                    // Clear the minority language selection
                    setFormData({
                      ...formData,
                      beneficiary_languages: formData.beneficiary_languages.filter(
                        (lang) =>
                          !languages.find((l) => l.code === lang)?.isMinority
                      ),
                    });
                  }}
                >
                  ✕ Clear & Select Another
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating Session..." : "Continue to Ingest"}
        </button>
      </form>

      {/* CONTEXT FOR CASEWORKER */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <p className="font-medium mb-2">💡 Persona Context</p>
        <p>
          You are a frontline protection worker. You're about to register a person who has
          arrived at your reception site. This system will help you quickly ingest documents,
          audio, and notes — and surface any discrepancies so you can make an informed decision.
          You always decide; the system never denies.
        </p>
      </div>
    </div>
  );
}

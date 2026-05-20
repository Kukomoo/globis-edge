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

  const languages = ["en", "ar", "fr", "am", "ti"];

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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caseworker Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <label key={lang} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.caseworker_languages.includes(lang)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        caseworker_languages: [
                          ...formData.caseworker_languages,
                          lang,
                        ],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        caseworker_languages:
                          formData.caseworker_languages.filter((l) => l !== lang),
                      });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">{lang.toUpperCase()}</span>
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
              <label key={lang} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.beneficiary_languages.includes(lang)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        beneficiary_languages: [
                          ...formData.beneficiary_languages,
                          lang,
                        ],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        beneficiary_languages:
                          formData.beneficiary_languages.filter(
                            (l) => l !== lang
                          ),
                      });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">{lang.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>

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
    </div>
  );
}

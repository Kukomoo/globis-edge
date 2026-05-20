import { useState, useEffect } from "react";
import { useSession } from "../../store/SessionContext";
import { generateExplainer } from "../../services/api";

export function Screen4_Explainer() {
  const { state, dispatch } = useSession();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (!explanation && state.id) {
      handleGenerateExplainer();
    }
  }, []);

  const handleGenerateExplainer = async () => {
    if (!state.id) return;
    setLoading(true);
    try {
      const response = await generateExplainer(state.id, language);
      setExplanation(response.data.explanation);
    } catch (err) {
      console.error("Failed to generate explainer", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Jargon-Free Summary</h1>
      <p className="text-gray-600 mb-6">
        Plain-language explanation of the intake record
      </p>

      <div className="mb-6 flex gap-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="en">English</option>
          <option value="ar">Arabic</option>
          <option value="fr">French</option>
          <option value="am">Amharic</option>
        </select>
        <button
          onClick={handleGenerateExplainer}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {explanation && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {explanation}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 3 })}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => dispatch({ type: "SET_SCREEN", payload: 5 })}
          disabled={!explanation}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          Continue to Dignity Loop
        </button>
      </div>
    </div>
  );
}

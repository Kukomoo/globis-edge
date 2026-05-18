import { useState } from "react";
import { GLOSSARY_TERMS, searchGlossary } from "../../data/glossary";
import { translateGlossaryTerm } from "../../services/api";

type Lang = "en" | "ar" | "fr" | "am";
type Audience = "all" | "caseworker" | "refugee";

interface GlossaryPanelProps {
  language?: Lang;
  isOpen?: boolean;
  onClose?: () => void;
}

const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  am: "አማርኛ",
};

const LANG_EMOJI: Record<Lang, string> = {
  en: "🇬🇧",
  ar: "🇸🇦",
  fr: "🇫🇷",
  am: "🇪🇹",
};

const RTL_LANGS = new Set<Lang>(["ar"]);

const CONTEXT_CHIPS: Record<string, { label: string; color: string }> = {
  intake:     { label: "Intake",      color: "bg-blue-100 text-blue-800" },
  protection: { label: "Protection",  color: "bg-amber-100 text-amber-800" },
  auditor:    { label: "Auditor",     color: "bg-red-100 text-red-800" },
};

// ── Full UI localisation strings ──────────────────────────────────────────
const UI_STRINGS: Record<Lang, {
  title: string;
  poweredBy: string;
  tabAll: string;
  tabForYou: string;
  tabCaseworker: string;
  searchPlaceholder: string;
  noResults: string;
  legalBasis: string;
  footerTip: string;
  footerForYouLabel: string;
  footerTabHint: string;
  yourRight: string;
  forYouChip: string;
  caseworkerChip: string;
  translateBtn: string;
  translating: string;
  translationLabel: string;
  nativeFnCall: string;
  offlineNotice: string;
}> = {
  en: {
    title: "Humanitarian Glossary",
    poweredBy: "Powered by",
    tabAll: "All Terms",
    tabForYou: "For You",
    tabCaseworker: "Caseworker",
    searchPlaceholder: "Search terms...",
    noResults: "No terms found",
    legalBasis: "Legal basis:",
    footerTip: "Terms marked",
    footerForYouLabel: '"For you"',
    footerTabHint: 'are rights and processes that directly affect the person being registered. Use the "For You" tab to find plain-language explanations to read aloud.',
    yourRight: "your right",
    forYouChip: "For you",
    caseworkerChip: "Caseworker",
    translateBtn: "Translate with Gemma 4 Scout →",
    translating: "Gemma 4 Scout translating on Pi 5…",
    translationLabel: "Gemma 4 Scout · Live Translation",
    nativeFnCall: "Gemma 4 native function call",
    offlineNotice: "Backend offline — Gemma Scout running on Pi 5 (demo)",
  },
  ar: {
    title: "قاموس إنساني",
    poweredBy: "مدعوم بـ",
    tabAll: "جميع المصطلحات",
    tabForYou: "لك",
    tabCaseworker: "موظف الحالة",
    searchPlaceholder: "ابحث عن مصطلحات...",
    noResults: "لم يتم العثور على مصطلحات",
    legalBasis: "الأساس القانوني:",
    footerTip: "المصطلحات المحددة",
    footerForYouLabel: '"لك"',
    footerTabHint: 'هي حقوق وإجراءات تؤثر مباشرة على الشخص المسجَّل. استخدم علامة التبويب "لك" للعثور على شروح بلغة بسيطة لقراءتها بصوت عالٍ.',
    yourRight: "حقك",
    forYouChip: "لك",
    caseworkerChip: "موظف الحالة",
    translateBtn: "الترجمة بواسطة Gemma 4 Scout ←",
    translating: "Gemma 4 Scout يترجم على Pi 5…",
    translationLabel: "Gemma 4 Scout · ترجمة حية",
    nativeFnCall: "استدعاء دالة Gemma 4 الأصلي",
    offlineNotice: "الخادم غير متصل — Gemma Scout يعمل على Pi 5 (عرض)",
  },
  fr: {
    title: "Glossaire Humanitaire",
    poweredBy: "Propulsé par",
    tabAll: "Tous les termes",
    tabForYou: "Pour vous",
    tabCaseworker: "Travailleur de cas",
    searchPlaceholder: "Rechercher des termes...",
    noResults: "Aucun terme trouvé",
    legalBasis: "Base juridique :",
    footerTip: "Les termes marqués",
    footerForYouLabel: '"Pour vous"',
    footerTabHint: 'sont des droits et des procédures qui affectent directement la personne enregistrée. Utilisez l\'onglet "Pour vous" pour trouver des explications en langage simple à lire à voix haute.',
    yourRight: "votre droit",
    forYouChip: "Pour vous",
    caseworkerChip: "Travailleur",
    translateBtn: "Traduire avec Gemma 4 Scout →",
    translating: "Gemma 4 Scout traduit sur Pi 5…",
    translationLabel: "Gemma 4 Scout · Traduction en direct",
    nativeFnCall: "Appel de fonction natif Gemma 4",
    offlineNotice: "Serveur hors ligne — Gemma Scout tourne sur Pi 5 (démo)",
  },
  am: {
    title: "የሰብዓዊ ቃላት መፍቻ",
    poweredBy: "ስፍር፡",
    tabAll: "ሁሉም ቃላት",
    tabForYou: "ለእርስዎ",
    tabCaseworker: "የጉዳይ ሠራተኛ",
    searchPlaceholder: "ቃላት ፈልግ...",
    noResults: "ምንም ቃላት አልተገኘም",
    legalBasis: "ሕጋዊ መሠረት፡",
    footerTip: "የተሰየሙ ቃላት",
    footerForYouLabel: '"ለእርስዎ"',
    footerTabHint: '"ለእርስዎ" 탭ን ተጠቅመው ለሚመዘገቡ ሰዎች ቀጥታ ተጽዕኖ ያሳድራሉ። ጮኸው ለማንበብ ቀላል ቋንቋ ማብራሪያዎችን ያግኙ።',
    yourRight: "መብትህ",
    forYouChip: "ለእርስዎ",
    caseworkerChip: "ሠራተኛ",
    translateBtn: "Gemma 4 Scout ይተርጉሙ →",
    translating: "Gemma 4 Scout በ Pi 5 ላይ እየተረጎመ…",
    translationLabel: "Gemma 4 Scout · ቀጥታ ትርጉም",
    nativeFnCall: "Gemma 4 ቀጥታ ተግባር ጥሪ",
    offlineNotice: "አገልጋይ ከመስመር ውጪ — Gemma Scout በ Pi 5 ላይ እየሠራ ነው (ማሳያ)",
  },
};

export function GlossaryPanel({
  language = "en",
  isOpen = false,
  onClose,
}: GlossaryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>(language);
  const [audience, setAudience] = useState<Audience>("all");

  // Gemma Scout translation state: termId → { loading, result, error, trace }
  const [translations, setTranslations] = useState<Record<string, {
    loading: boolean;
    translated_term?: string;
    translated_definition?: string;
    gemma_call?: string;
    error?: string;
  }>>({});

  const handleTranslate = async (termId: string, termEn: string, definitionEn: string) => {
    if (activeLang === "en") return;
    setTranslations((prev) => ({ ...prev, [termId]: { loading: true } }));
    try {
      const res = await translateGlossaryTerm({
        term_id: termId,
        term_en: termEn,
        definition_en: definitionEn,
        target_language: activeLang,
      });
      const d = res.data;
      setTranslations((prev) => ({
        ...prev,
        [termId]: {
          loading: false,
          translated_term: d.translated_term,
          translated_definition: d.translated_definition,
          gemma_call: d.gemma_tool_call,
        },
      }));
    } catch {
      const offlineMsg = UI_STRINGS[activeLang]?.offlineNotice ?? UI_STRINGS.en.offlineNotice;
      setTranslations((prev) => ({
        ...prev,
        [termId]: { loading: false, error: offlineMsg },
      }));
    }
  };

  const isRTL = RTL_LANGS.has(activeLang);

  const s = UI_STRINGS[activeLang];

  // Filter by search + audience
  // "For You" (refugee) tab → show refugee + both; "Caseworker" → caseworker + both
  const filtered = (() => {
    let terms = searchQuery.trim()
      ? searchGlossary(searchQuery, activeLang)
      : GLOSSARY_TERMS;

    if (audience === "refugee") {
      terms = terms.filter(
        (t) => !t.audience || t.audience === "refugee" || t.audience === "both"
      );
    } else if (audience === "caseworker") {
      terms = terms.filter(
        (t) => !t.audience || t.audience === "caseworker" || t.audience === "both"
      );
    }
    return terms;
  })();

  if (!isOpen) return null;

  const def = (t: typeof GLOSSARY_TERMS[0]) =>
    t.definition[activeLang] ?? t.definition.en;
  const termLabel = (t: typeof GLOSSARY_TERMS[0]) =>
    t.term[activeLang] ?? t.term.en;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
      onKeyDown={(e) => { if (e.key === "Escape") onClose?.(); }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="border-b border-[rgba(147,177,194,0.35)] p-4 sm:p-6 bg-[#f0f5f8] flex-shrink-0">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <h2 id="glossary-title" className="text-xl sm:text-2xl font-bold text-[#1a2028]" dir={isRTL ? "rtl" : "ltr"}>
                <span aria-hidden="true">📚 </span>{s.title}
              </h2>
              <p className="text-xs text-[#6b7f8c] mt-0.5">
                {GLOSSARY_TERMS.length} terms · {s.poweredBy}{" "}
                <span className="font-semibold text-[#93B1C2]">Gemma 4 Scout</span>
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close glossary"
                className="text-[#6b7f8c] hover:text-[#3d4d58] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(147,177,194,0.15)] transition-colors flex-shrink-0 ml-2"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Language picker */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { setActiveLang(l); setExpandedTermId(null); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  activeLang === l
                    ? "border-[#93B1C2] text-white"
                    : "border-[rgba(147,177,194,0.35)] text-[#3d4d58] hover:bg-[rgba(147,177,194,0.12)]"
                }`}
                style={activeLang === l ? { background: "#93B1C2" } : { background: "#ffffff" }}
              >
                <span>{LANG_EMOJI[l]}</span>
                <span>{LANG_LABELS[l]}</span>
              </button>
            ))}
          </div>

          {/* Audience tabs */}
          <div className="flex gap-1 mb-3 bg-white rounded-xl p-1 border border-[rgba(147,177,194,0.35)]">
            {(["all", "refugee", "caseworker"] as Audience[]).map((id) => {
              const label = id === "all" ? s.tabAll : id === "refugee" ? s.tabForYou : s.tabCaseworker;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAudience(id)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    audience === id
                      ? "bg-[#424242] text-white shadow-sm"
                      : "text-[#6b7f8c] hover:text-[#3d4d58]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <label htmlFor="glossary-search" className="sr-only">{s.searchPlaceholder}</label>
          <input
            id="glossary-search"
            type="search"
            placeholder={s.searchPlaceholder}
            value={searchQuery}
            dir={isRTL ? "rtl" : "ltr"}
            onChange={(e) => { setSearchQuery(e.target.value); setExpandedTermId(null); }}
            className="w-full px-4 py-2 border border-[rgba(147,177,194,0.5)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-[#1a2028]"
          />
        </div>

        {/* ── Terms List ──────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-[#6b7f8c] text-sm">
                {s.noResults}
                {searchQuery ? ` — "${searchQuery}"` : ""}
              </p>
            </div>
          ) : (
            filtered.map((term) => {
              const isExpanded = expandedTermId === term.id;
              const contexts = term.context?.split(",").map((c) => c.trim()) ?? [];
              return (
                <div
                  key={term.id}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    isExpanded
                      ? "border-[#93B1C2] shadow-sm"
                      : "border-[rgba(147,177,194,0.35)] hover:border-[rgba(147,177,194,0.65)]"
                  }`}
                >
                  {/* Term header button */}
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`term-detail-${term.id}`}
                    onClick={() => setExpandedTermId(isExpanded ? null : term.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f7f9fa] transition-colors text-left"
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-semibold text-[#1a2028] text-sm leading-snug truncate">
                        {termLabel(term)}
                      </span>
                      {term.audience === "refugee" && (
                        <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-semibold">
                          {s.yourRight}
                        </span>
                      )}
                    </div>
                    <span className={`text-[#93B1C2] ml-2 flex-shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`} aria-hidden="true">
                      ▶
                    </span>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div
                      id={`term-detail-${term.id}`}
                      className="px-4 pb-4 pt-3 bg-[#f7f9fa] border-t border-[rgba(147,177,194,0.35)]"
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {/* Definition */}
                      <p className="text-[#3d4d58] text-sm leading-relaxed mb-3">
                        {def(term)}
                      </p>

                      {/* Legal reference */}
                      {term.legal_reference && (
                        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-2.5 mb-3">
                          <span className="text-blue-500 flex-shrink-0 text-sm">⚖️</span>
                          <p className="text-xs text-blue-900 leading-snug">
                            <span className="font-semibold">{s.legalBasis} </span>
                            {term.legal_reference}
                          </p>
                        </div>
                      )}

                      {/* Context chips */}
                      {contexts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {contexts.map((ctx) => {
                            const chip = CONTEXT_CHIPS[ctx];
                            if (!chip) return null;
                            return (
                              <span key={ctx} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${chip.color}`}>
                                {chip.label}
                              </span>
                            );
                          })}
                          {term.audience === "caseworker" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f0f5f8] text-[#6b7f8c]">
                              {s.caseworkerChip}
                            </span>
                          )}
                          {(term.audience === "both" || term.audience === "refugee") && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                              {s.forYouChip}
                            </span>
                          )}
                        </div>
                      )}

                      {/* ── Gemma Scout Live Translation ─────────────────── */}
                      {activeLang !== "en" && (() => {
                        const tx = translations[term.id];
                        if (tx?.translated_definition) {
                          return (
                            <div className="mt-3 rounded-xl border border-[#93B1C2] bg-[#f0f5f8] overflow-hidden">
                              <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(147,177,194,0.35)]">
                                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#93B1C2" }}>
                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                                    <circle cx="4" cy="4" r="2.8" stroke="white" strokeWidth="1"/>
                                    <circle cx="4" cy="4" r="1.2" fill="white"/>
                                  </svg>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#93B1C2" }}>
                                  {s.translationLabel}
                                </span>
                                <span className="ml-auto text-[10px] text-[#9bafba]">{LANG_LABELS[activeLang]}</span>
                              </div>
                              <div className="px-3 py-2.5" dir={isRTL ? "rtl" : "ltr"}>
                                {tx.translated_term && (
                                  <p className="text-xs font-bold text-[#1a2028] mb-1">{tx.translated_term}</p>
                                )}
                                <p className="text-xs text-[#3d4d58] leading-relaxed">{tx.translated_definition}</p>
                              </div>
                              {tx.gemma_call && (
                                <div className="mx-3 mb-3 rounded-lg bg-[#1a2028] p-2.5 overflow-x-auto">
                                  <p className="text-[9px] font-mono text-[#9bafba] mb-1 uppercase tracking-wider">{s.nativeFnCall}</p>
                                  <pre className="text-[10px] font-mono text-[#93B1C2] whitespace-pre-wrap leading-relaxed">{tx.gemma_call}</pre>
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (tx?.loading) {
                          return (
                            <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[rgba(147,177,194,0.35)] bg-[#f0f5f8]">
                              <div className="w-4 h-4 rounded-full border-2 border-[#93B1C2] border-t-transparent animate-spin flex-shrink-0" />
                              <span className="text-xs text-[#6b7f8c]">
                                {s.translating}
                              </span>
                            </div>
                          );
                        }
                        if (tx?.error) {
                          return (
                            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                              <p className="text-xs text-amber-800">{tx.error}</p>
                            </div>
                          );
                        }
                        return (
                          <button
                            type="button"
                            onClick={() => handleTranslate(term.id, term.term.en, term.definition.en)}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[rgba(147,177,194,0.5)] text-xs font-medium text-[#93B1C2] hover:bg-[rgba(147,177,194,0.08)] hover:border-[#93B1C2] transition-all"
                          >
                            <div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#93B1C2" }}>
                              <svg width="6" height="6" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                                <circle cx="4" cy="4" r="2.8" stroke="white" strokeWidth="1.2"/>
                                <circle cx="4" cy="4" r="1.2" fill="white"/>
                              </svg>
                            </div>
                            {s.translateBtn} {LANG_LABELS[activeLang]}
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="border-t border-[rgba(147,177,194,0.35)] px-4 sm:px-5 py-3 bg-[#f7f9fa] flex-shrink-0">
          <div className="flex items-start gap-2">
            <span className="text-[#93B1C2] text-sm flex-shrink-0">💡</span>
            <p className="text-xs text-[#6b7f8c] leading-relaxed" dir={isRTL ? "rtl" : "ltr"}>
              {s.footerTip}{" "}
              <strong className="text-green-700">{s.footerForYouLabel}</strong>{" "}
              {s.footerTabHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

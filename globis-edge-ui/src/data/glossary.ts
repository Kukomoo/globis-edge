// Multi-language glossary for humanitarian terms
// Used by GlossaryTooltip and GlossaryPanel components

export interface GlossaryTerm {
  id: string;
  term: {
    en: string;
    ar: string;
    fr: string;
  };
  definition: {
    en: string;
    ar: string;
    fr: string;
  };
  context?: string; // Where this term appears (e.g., "auditor", "intake", "protection")
  legal_reference?: string; // e.g., "1951 Refugee Convention, Article 31"
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: "article_31",
    term: {
      en: "Article 31 (Refugee Convention)",
      ar: "المادة 31 (اتفاقية اللاجئين)",
      fr: "Article 31 (Convention sur les réfugiés)",
    },
    definition: {
      en: "International protection principle requiring states to NOT penalize refugees for unlawful entry or presence. Applies minimum data collection principles.",
      ar: "مبدأ الحماية الدولية الذي يتطلب من الدول عدم معاقبة اللاجئين على الدخول غير القانوني أو الوجود. ينطبق على مبادئ جمع البيانات الدنيا.",
      fr: "Principe de protection internationale exigeant que les États ne pénalisent pas les réfugiés pour entrée ou présence non autorisée. S'applique aux principes minimaux de collecte de données.",
    },
    legal_reference: "1951 Refugee Convention, Article 31",
    context: "auditor, protection",
  },
  {
    id: "excom",
    term: {
      en: "ExCom Conclusion No. 8",
      ar: "استنتاج اللجنة الدولية رقم 8",
      fr: "Conclusion No. 8 du Comité Exécutif",
    },
    definition: {
      en: "UNHCR Executive Committee guidance on determination of refugee status. Establishes international standards for fairness and due process in refugee assessment.",
      ar: "إرشادات لجنة UNHCR التنفيذية بشأن تحديد وضع اللاجئ. تحدد المعايير الدولية للعدالة والإجراءات القانونية الواجبة في تقييم اللاجئ.",
      fr: "Orientation du Comité Exécutif du HCR sur la détermination du statut de réfugié. Établit les normes internationales d'équité et de procédure régulière.",
    },
    legal_reference: "UNHCR ExCom Conclusion No. 8",
    context: "auditor, protection",
  },
  {
    id: "ier",
    term: {
      en: "IER (Initial Emergency Registration)",
      ar: "التسجيل الطوارئ الأولي",
      fr: "IER (Enregistrement d'Urgence Initial)",
    },
    definition: {
      en: "Level 1 registration for newly arrived refugees in emergency situations. Captures minimum data needed for immediate protection assessment and service provision.",
      ar: "تسجيل المستوى الأول للاجئين الوافدين حديثاً في حالات الطوارئ. يجمع البيانات الدنيا اللازمة لتقييم الحماية الفوري وتقديم الخدمات.",
      fr: "Enregistrement de niveau 1 pour les réfugiés nouvellement arrivés en situation d'urgence. Capture les données minimales nécessaires pour l'évaluation immédiate de la protection.",
    },
    context: "intake",
  },
  {
    id: "primes",
    term: {
      en: "PRIMES (Registration System)",
      ar: "نظام التسجيل المتكامل",
      fr: "PRIMES (Système d'Enregistrement)",
    },
    definition: {
      en: "UNHCR's integrated registration and case management system. Includes proGres, RApp, BIMS, and PING modules for comprehensive refugee data management.",
      ar: "نظام التسجيل والإدارة الحالات المتكامل من UNHCR. يشمل وحدات proGres و RApp و BIMS و PING لإدارة بيانات اللاجئين الشاملة.",
      fr: "Système intégré d'enregistrement et de gestion des cas du HCR. Comprend les modules proGres, RApp, BIMS et PING pour la gestion complète des données des réfugiés.",
    },
    context: "intake, auditor",
  },
  {
    id: "progres",
    term: {
      en: "proGres (Registration Database)",
      ar: "قاعدة بيانات التسجيل",
      fr: "proGres (Base de Données d'Enregistrement)",
    },
    definition: {
      en: "Core UNHCR database for refugee registration and individual case data. Stores biographical, protection, and assistance information in compliance with data protection standards.",
      ar: "قاعدة بيانات UNHCR الأساسية لتسجيل اللاجئين وبيانات الحالات الفردية. تخزن المعلومات البيوغرافية والحماية والمساعدات وفقاً لمعايير حماية البيانات.",
      fr: "Base de données principale du HCR pour l'enregistrement des réfugiés et les données de cas individuels. Stocke les informations biographiques, de protection et d'assistance.",
    },
    context: "intake",
  },
  {
    id: "constitutional_auditor",
    term: {
      en: "Constitutional Auditor",
      ar: "المدقق الدستوري",
      fr: "Auditeur Constitutionnel",
    },
    definition: {
      en: "AI system that reviews extracted refugee data against a 'constitution' of humanitarian principles (Article 31, data minimization, no automated denial, etc.). Flags sensitive fields and explains decisions.",
      ar: "نظام ذكاء اصطناعي يراجع بيانات اللاجئين المستخرجة مقابل 'دستور' من المبادئ الإنسانية. يشير إلى الحقول الحساسة ويشرح القرارات.",
      fr: "Système d'IA qui examine les données des réfugiés extraites par rapport à une 'constitution' de principes humanitaires. Signale les champs sensibles et explique les décisions.",
    },
    context: "auditor",
  },
  {
    id: "data_minimization",
    term: {
      en: "Data Minimization",
      ar: "تقليل البيانات",
      fr: "Minimisation des Données",
    },
    definition: {
      en: "Data protection principle: collect only what is necessary, for stated purposes, and no more. Blocks sensitive fields (political affiliation, religion, health) unless essential for protection.",
      ar: "مبدأ حماية البيانات: جمع ما هو ضروري فقط، للأغراض المذكورة، لا أكثر. يحظر الحقول الحساسة إلا إذا كانت ضرورية للحماية.",
      fr: "Principe de protection des données : collecter uniquement ce qui est nécessaire, pour les fins déclarées, et pas plus. Bloque les champs sensibles sauf s'ils sont essentiels.",
    },
    legal_reference: "UNHCR Data Protection Policy",
    context: "auditor, protection",
  },
  {
    id: "purpose_limitation",
    term: {
      en: "Purpose Limitation",
      ar: "تحديد الغرض",
      fr: "Limitation du Consentement",
    },
    definition: {
      en: "Data protection principle: personal information collected for one purpose cannot be used for another without consent. Intake data used for protection assessment only, not for other processes.",
      ar: "مبدأ حماية البيانات: المعلومات الشخصية المجمعة لغرض ما لا يمكن استخدامها لغرض آخر بدون موافقة. بيانات الالتحاق تُستخدم فقط لتقييم الحماية.",
      fr: "Principe de protection des données : les informations personnelles collectées à une fin ne peuvent être utilisées à une autre fin sans consentement.",
    },
    legal_reference: "UNHCR Data Protection Policy",
    context: "auditor, protection",
  },
  {
    id: "informed_consent",
    term: {
      en: "Informed Consent",
      ar: "الموافقة المستنيرة",
      fr: "Consentement Éclairé",
    },
    definition: {
      en: "Individual understands what data is being collected, why, how it will be used, and who will have access. Refugee must agree knowingly and voluntarily.",
      ar: "الفرد يفهم ما هي البيانات التي يتم جمعها، ولماذا، وكيف سيتم استخدامها، ومن سيكون لديه وصول. يجب على اللاجئ الموافقة بوعي وطواعية.",
      fr: "L'individu comprend quelles données sont collectées, pourquoi, comment elles seront utilisées et qui y aura accès. Le réfugié doit consentir consciemment et volontairement.",
    },
    context: "intake, protection",
  },
  {
    id: "dignity",
    term: {
      en: "Dignity Loop",
      ar: "حلقة الكرامة",
      fr: "Boucle de Dignité",
    },
    definition: {
      en: "Process of translating structured case data back to the refugee in their language, in plain language, to confirm accuracy and respect their voice. 'We recorded that you... Is this correct?'",
      ar: "عملية ترجمة بيانات القضية المهيكلة مرة أخرى إلى اللاجئ بلغته، بلغة بسيطة، للتأكد من الدقة واحترام صوتهم. 'لقد سجلنا أنك... هل هذا صحيح؟'",
      fr: "Processus de traduction des données de cas structurées au réfugié dans sa langue, en langage clair, pour confirmer l'exactitude et respecter sa voix.",
    },
    context: "intake, protection",
  },
  {
    id: "multimodal_synthesis",
    term: {
      en: "Multimodal Synthesis",
      ar: "التركيب متعدد الأنماط",
      fr: "Synthèse Multimodale",
    },
    definition: {
      en: "Extracting and combining information from multiple sources: ID photo, audio testimony, caseworker notes. Cross-referencing facts across modalities to reduce errors.",
      ar: "استخراج ودمج المعلومات من مصادر متعددة: صورة الهوية، الشهادة الصوتية، ملاحظات العامل الاجتماعي. المقارنة المرجعية للحقائق عبر الأنماط المختلفة.",
      fr: "Extraction et combinaison d'informations provenant de plusieurs sources : photo d'identité, témoignage audio, notes du travailleurs sociaux.",
    },
    context: "intake, auditor",
  },
  {
    id: "explainability",
    term: {
      en: "Explainability (XAI)",
      ar: "قابلية التفسير",
      fr: "Explicabilité (XAI)",
    },
    definition: {
      en: "System shows WHY it made a decision, not just WHAT it decided. Example: 'field was blocked because it's protected under Article 31, and the audio testimony mentioned...'",
      ar: "يوضح النظام سبب اتخاذه قراراً، وليس فقط ما قرره. المثال: 'تم حظر الحقل لأنه محمي بموجب المادة 31، والشهادة الصوتية ذكرت...'",
      fr: "Le système montre POURQUOI il a pris une décision, pas seulement QUOI il a décidé. Exemple : 'le champ a été bloqué parce qu'il est protégé par l'article 31...'",
    },
    context: "auditor, protection",
  },
];

// Helper function to get term by language
export function getGlossaryTermTranslation(
  termId: string,
  _language: "en" | "ar" | "fr" = "en"
): GlossaryTerm | undefined {
  const term = GLOSSARY_TERMS.find((t) => t.id === termId);
  return term;
}

// Helper function to search glossary
export function searchGlossary(
  query: string,
  lang: "en" | "ar" | "fr" = "en"
): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return GLOSSARY_TERMS.filter((term) => {
    const termText = term.term[lang].toLowerCase();
    const defText = term.definition[lang].toLowerCase();
    return termText.includes(lowerQuery) || defText.includes(lowerQuery);
  });
}

// Helper to get all terms for a context
export function getTermsByContext(
  context: string,
  _language: "en" | "ar" | "fr" = "en"
): GlossaryTerm[] {
  return GLOSSARY_TERMS.filter((term) =>
    term.context?.split(",").map((c) => c.trim()).includes(context)
  );
}

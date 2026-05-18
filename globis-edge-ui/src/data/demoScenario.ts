/**
 * DEMO SCENARIOS — Globis Edge 2.0
 * Synthetic data only. Used for hackathon demo autofill.
 *
 * Two scenarios, selectable from the topbar:
 *   A — Hawa Adam (Adré, Chad): dossier reconstruction + cross-modal conflict
 *   B — Yusuf Ahmed Hassan (Eisenhüttenstadt): auditor block + quarantine chip
 */

// ── Scenario A: Hawa Adam — Dossier Reconstruction + Conflict ─────────────
export const DEMO_SCENARIO_A = {
  label: "Scenario A — Hawa (Adré)",
  description: "Dossier reconstruction · Cross-modal conflict",

  session: {
    site: "Adré Reception Point — Tent 4 (Chad/Sudan border)",
    caseworker_languages: ["en", "ar", "fr"],
    beneficiary_languages: ["ar", "fr"],
  },

  artifacts: [
    {
      modality: "image",
      filename: "hawa_passport_damaged_synthetic.jpg",
      label: "Damaged Sudanese Passport",
      preview:
        "OCR (Surya, ~3.8s): Name: Hawa A. Adam · DOB: 1988 · Origin: Al-Geneina, Darfur · Child: Musa Adam, DOB: 2016? · EXPIRED 2015",
      icon: "📷",
    },
    {
      modality: "image",
      filename: "hawa_unhcr_token_synthetic.jpg",
      label: "UNHCR Temporary Registration Token",
      preview:
        "OCR (Surya): Principal: Hawa Adam · DOB: 1988 · Dependent: Musa A., DOB: 2017 · Token: TRT-2026-0510-00147 · Site: Adré",
      icon: "🪪",
    },
    {
      modality: "audio",
      filename: "hawa_testimony_arabic_synthetic.wav",
      label: "Audio Testimony (Arabic Sudanese dialect, ~90s)",
      preview:
        'Transcript (Scout E2B, 820ms): "My name is Hawa Adam. I have one child with me, Musa Adam. We left Al-Geneina because of the fighting. We crossed near Adré last week. The birth year on my papers may be wrong — there are two different dates."',
      icon: "🎤",
    },
    {
      modality: "text",
      filename: "caseworker_note_hawa_synthetic.txt",
      label: "Caseworker Intake Note",
      preview:
        "Family arrived via informal group. Mother presents documents but notes discrepancy in child's birth year: passport says 2016?, UNHCR token says 2017. Mother alert and responsive. Child present, appears healthy. Recommend human review of birth year before finalization.",
      icon: "📝",
    },
  ],

  conflict: {
    field: "dependent_birth_year",
    passport_value: "2016?",
    token_value: "2017",
    severity: "medium",
    explanation:
      "Passport OCR shows '2016?' with uncertainty marker. UNHCR token shows '2017'. School certificate (Std 2, 2023–24) is ambiguous. Human review required before commit.",
  },

  dignityText: {
    en: "We have recorded that your name is Hawa Adam. You arrived at Adré with your son Musa from Al-Geneina, Sudan. Your names and origin are confirmed across all your documents. However, your child's year of birth appears differently on two papers — one says 2016 and another says 2017. A caseworker will clarify this with you. Is everything else correct?",
    ar: "لقد سجّلنا أن اسمك هوى آدم. وصلت إلى أدري مع ابنك موسى من الجنينة في السودان. أسماؤكم وبلد منشأكم متطابقان في جميع وثائقكم. غير أن سنة ميلاد طفلك تختلف في وثيقتين — إحداهما تقول 2016 والأخرى 2017. سيوضح معك أحد الموظفين هذه النقطة. هل كل شيء آخر صحيح؟",
    fr: "Nous avons enregistré que vous vous appelez Hawa Adam. Vous êtes arrivée à Adré avec votre fils Musa depuis Al-Geneina, Soudan. Vos noms et pays d'origine sont confirmés dans tous vos documents. Cependant, l'année de naissance de votre enfant diffère entre deux documents — l'un indique 2016 et l'autre 2017. Un agent clarifiera ce point avec vous. Tout le reste est-il correct ?",
  },
} as const;

// ── Scenario B: Yusuf Ahmed Hassan — Auditor Block + Quarantine ───────────
export const DEMO_SCENARIO_B = {
  label: "Scenario B — Yusuf (Eisenhüttenstadt)",
  description: "Auditor block · Quarantine chip",

  session: {
    site: "BAMF Reception Centre — Eisenhüttenstadt, Germany",
    caseworker_languages: ["de", "en", "ar"],
    beneficiary_languages: ["ar"],
  },

  artifacts: [
    {
      modality: "image",
      filename: "yusuf_national_id_chad_synthetic.jpg",
      label: "National ID (Chad, valid)",
      preview:
        "OCR (Surya, ~3.2s): Name: Yusuf Ahmed Hassan · DOB: 1992-03-15 · Origin: Goz Beida, Dar Sila Region · Nationality: Chadian · Expiry: 2029-01-20",
      icon: "📷",
    },
    {
      modality: "audio",
      filename: "yusuf_testimony_arabic_synthetic.wav",
      label: "Audio Testimony (Chadian Arabic, ~2 min)",
      preview:
        'Transcript (Scout E2B, 820ms): "My name is Yusuf Ahmed Hassan. I left Chad because my government was targeting people from my ethnic group for military conscription. I refused to join the militia. The police visited my family\'s home twice. I escaped with a neighbor\'s help."',
      icon: "🎤",
    },
    {
      modality: "text",
      filename: "caseworker_note_yusuf_synthetic.txt",
      label: "Caseworker Intake Note (Tobias, BAMF)",
      preview:
        "Applicant arrived with single identity document. Testimony mentions persecution related to ethnic background and military service refusal. Applicant coherent, describes travel route clearly. No health concerns. Forward to case assessment unit. Note: ethnic targeting + militia conscription may invoke Article 31 protections.",
      icon: "📝",
    },
  ],

  // Auditor block — shown in Screen 3 instead of a cross-modal conflict
  auditorBlock: {
    blocked_field: "ethnicity_based_persecution_concern",
    trigger: "Testimony mentions ethnic targeting",
    rule: "PROHIBITED_FIELDS — ethnicity",
    value_logged: false,
    constitutional_basis: "Article 31, 1951 Refugee Convention",
    caseworker_chip:
      "⊘ A sensitive field category was blocked from this record. Value was NOT logged. Review before commit.",
  },

  dignityText: {
    en: "This record cannot be read back in the Dignity Loop until the flagged field has been reviewed by a caseworker. The Constitutional Auditor has quarantined this record for human review.",
    ar: "لا يمكن قراءة هذا السجل في حلقة الكرامة حتى يراجع الموظف الحقل الذي تم الإشارة إليه. لقد وضع المدقق الدستوري هذا السجل في الحجر الصحي لمراجعة بشرية.",
    fr: "Ce dossier ne peut pas être lu dans la Boucle de Dignité tant que le champ signalé n'a pas été examiné par un agent. L'Auditeur Constitutionnel a mis ce dossier en quarantaine pour examen humain.",
  },
} as const;

// Default demo is Scenario A (dossier reconstruction is the richer visual)
export const DEMO_SCENARIO = DEMO_SCENARIO_A;

export type DemoScenarioA = typeof DEMO_SCENARIO_A;
export type DemoScenarioB = typeof DEMO_SCENARIO_B;

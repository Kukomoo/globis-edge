/**
 * DEMO SCENARIO — Yusuf Ahmed Hassan
 * Synthetic data only. Used for hackathon demo autofill.
 *
 * Pressing "⚡ Load Demo" in the topbar pre-populates the entire
 * 6-screen intake flow so judges can see all functionality without
 * typing anything.
 */

export const DEMO_SCENARIO = {
  // ── Screen 1: Session setup ─────────────────────────────────────
  session: {
    site: "Adré Reception Point — Tent 4 (Chad/Sudan border)",
    caseworker_languages: ["en", "ar", "fr"],
    beneficiary_languages: ["ar"],
  },

  // ── Screen 2: Synthetic artifact previews ───────────────────────
  // These are shown as "pre-loaded" artifacts in the ingest screen.
  // The backend already has Yusuf's case loaded; these are UI-only labels.
  artifacts: [
    {
      modality: "image",
      filename: "yusuf_national_id_synthetic.jpg",
      label: "National ID (Sudanese)",
      preview:
        "OCR extracted: Name: Yusuf Ahmed Hassan · DOB: 1991-03-14 · Origin: Darfur, Sudan · ID: SD-NID-1991-0314-7821",
      icon: "📷",
    },
    {
      modality: "audio",
      filename: "yusuf_testimony_arabic_synthetic.wav",
      label: "Audio Testimony (Arabic, ~2 min)",
      preview:
        'Transcript (Scout E2B, 820ms): "My name is Yusuf. I left Darfur because I refused military conscription. I crossed with my two sons, Amir aged 7 and Omar aged 4. Omar needs medical attention for a respiratory infection..."',
      icon: "🎤",
    },
    {
      modality: "text",
      filename: "caseworker_notes_synthetic.txt",
      label: "Caseworker Notes",
      preview:
        "Arrived 2024-11-14 via Adré border crossing. Refused military conscription in Sudan. Two male children with him. Eldest child (7) healthy; youngest (4) showing signs of respiratory distress. No documentation for children. Claims national ID is authentic.",
      icon: "📝",
    },
  ],

  // ── Cross-modal conflict (shown in Screen 3) ─────────────────────
  conflict: {
    field: "date_of_birth",
    id_value: "1991-03-14",
    audio_value: "approximately 1989 or 1990",
    severity: "medium",
    explanation:
      "ID document states 1991-03-14. Audio testimony mentions 'around 31 or 32 years old' (recorded Nov 2024 → implies ~1992–1993). Caseworker notes do not mention age. Recommend caseworker clarify verbally.",
  },

  // ── Dignity Loop narrative (shown in Screen 5) ────────────────────
  dignityText: {
    en: "We have recorded that your name is Yusuf Ahmed Hassan. You arrived at Adré on 14 November 2024 from Darfur, Sudan, with your two sons Amir (age 7) and Omar (age 4). We have noted that Omar needs medical attention. Your national ID has been photographed. A discrepancy in your year of birth has been flagged — a caseworker will ask you about this. Is everything else correct?",
    ar: "لقد سجّلنا أن اسمك يوسف أحمد حسن. وصلت إلى أدري في 14 نوفمبر 2024 من دارفور بالسودان برفقة ولديك عامر (7 سنوات) وعمر (4 سنوات). لقد لاحظنا أن عمر يحتاج إلى رعاية طبية. تم تصوير بطاقة هويتك الوطنية. هناك تناقض في سنة ميلادك — سيسألك أحد العمال الاجتماعيين عن ذلك. هل كل شيء آخر صحيح؟",
    fr: "Nous avons enregistré que vous vous appelez Yusuf Ahmed Hassan. Vous êtes arrivé à Adré le 14 novembre 2024 depuis le Darfour, au Soudan, accompagné de vos deux fils Amir (7 ans) et Omar (4 ans). Nous avons noté qu'Omar a besoin de soins médicaux. Votre carte d'identité nationale a été photographiée. Une divergence sur votre année de naissance a été signalée — un agent vous en parlera. Tout le reste est-il correct ?",
  },
} as const;

export type DemoScenario = typeof DEMO_SCENARIO;

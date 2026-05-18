// Multi-language glossary for humanitarian terms
// Used by GlossaryTooltip and GlossaryPanel components
// Languages: en, ar, fr, am (Amharic)

export interface GlossaryTerm {
  id: string;
  term: { en: string; ar: string; fr: string; am: string };
  definition: { en: string; ar: string; fr: string; am: string };
  context?: string;
  legal_reference?: string;
  audience?: "caseworker" | "refugee" | "both";
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ── LEGAL FOUNDATIONS ──────────────────────────────────────────────────────
  {
    id: "article_31",
    term: {
      en: "Article 31 (Refugee Convention)",
      ar: "المادة 31 (اتفاقية اللاجئين)",
      fr: "Article 31 (Convention sur les réfugiés)",
      am: "አንቀጽ 31 (የስደተኛ ስምምነት)",
    },
    definition: {
      en: "States cannot punish you for crossing a border without papers if you are fleeing persecution. You have the right to present yourself to authorities and ask for protection.",
      ar: "لا يحق للدول معاقبتك على عبور الحدود بدون وثائق إذا كنت تفر من الاضطهاد. لديك الحق في تقديم نفسك للسلطات وطلب الحماية.",
      fr: "Les États ne peuvent pas vous punir pour avoir traversé une frontière sans papiers si vous fuyez la persécution. Vous avez le droit de vous présenter aux autorités et de demander une protection.",
      am: "ስደትን ሸሽተህ ከሄድክ ወረቀት ሳይኖርህ ድንበር ቢተላለፍ አገሮች ሊቀጡህ አይችሉም። ለባለ ሥልጣናት ቀርበህ ጥበቃ የመጠየቅ መብት አለህ።",
    },
    legal_reference: "1951 Refugee Convention, Article 31",
    context: "protection, intake",
    audience: "both",
  },
  {
    id: "non_refoulement",
    term: {
      en: "Non-Refoulement",
      ar: "مبدأ عدم الإعادة القسرية",
      fr: "Non-Refoulement",
      am: "ወደ ትውልድ አገር ግዳጅ አለመመለስ",
    },
    definition: {
      en: "The most important protection rule: no country can send you back to a place where your life or freedom is at risk. This applies even if you entered irregularly.",
      ar: "أهم قاعدة للحماية: لا يجوز لأي دولة إعادتك إلى مكان تكون فيه حياتك أو حريتك في خطر. ينطبق هذا حتى لو دخلت بشكل غير نظامي.",
      fr: "La règle de protection la plus importante : aucun pays ne peut vous renvoyer dans un endroit où votre vie ou votre liberté est en danger. Ceci s'applique même si vous êtes entré irrégulièrement.",
      am: "ትልቁ የጥበቃ ህግ፡ ሕይወትህ ወይም ነፃነትህ አደጋ ላይ ወዳለበት ቦታ ምንም አገር ሊልክህ አይችልም። ምንም እንኳን ሕጋዊ ባልሆነ መንገድ ቢገቡ ይህ ይሠራል።",
    },
    legal_reference: "1951 Refugee Convention, Article 33",
    context: "protection",
    audience: "both",
  },
  {
    id: "excom",
    term: {
      en: "ExCom Conclusion No. 8 — Interpreter Right",
      ar: "استنتاج اللجنة التنفيذية رقم 8 — حق المترجم",
      fr: "Conclusion No. 8 du Comité Exécutif — Droit à un interprète",
      am: "የሥራ አስፈጻሚ ኮሚቴ መደምደሚያ ቁ. 8 — የአስተርጓሚ መብት",
    },
    definition: {
      en: "You have the right to speak with a qualified interpreter during your registration and asylum process — at no cost to you. If no interpreter is available, the caseworker must note this and delay the interview.",
      ar: "لديك الحق في التحدث مع مترجم مؤهل أثناء تسجيلك وعملية اللجوء — مجانًا. إذا لم يكن هناك مترجم متاح، يجب على الموظف تدوين ذلك وتأجيل المقابلة.",
      fr: "Vous avez le droit de parler avec un interprète qualifié lors de votre enregistrement et de votre procédure d'asile — gratuitement. Si aucun interprète n'est disponible, l'agent doit le noter et reporter l'entretien.",
      am: "በምዝገባ እና ጥገኝነት ሂደትህ ወቅት ብቁ ከሆነ አስተርጓሚ ጋር ለመናገር መብት አለህ — ምንም ክፍያ ሳይኖርብህ። አስተርጓሚ ካልተገኘ ሠራተኛው ይህን ሊያስታውስ እና ቃለ መጠይቁን ሊያራዝም ይገባዋል።",
    },
    legal_reference: "UNHCR ExCom Conclusion No. 8 (XXVIII, 1977)",
    context: "intake, protection",
    audience: "both",
  },
  // ── REGISTRATION PROCESS ──────────────────────────────────────────────────
  {
    id: "ier",
    term: {
      en: "IER — Initial Emergency Registration",
      ar: "التسجيل الطارئ الأولي",
      fr: "IER — Enregistrement d'Urgence Initial",
      am: "IER — የመጀመሪያ ድንገተኛ ምዝገባ",
    },
    definition: {
      en: "The first, quick registration done when you arrive. It records your name, date of birth, nationality, and why you came. It does NOT decide your status — that comes later. Getting registered protects you.",
      ar: "التسجيل الأول والسريع الذي يتم عند وصولك. يسجل اسمك وتاريخ ميلادك وجنسيتك وسبب قدومك. لا يحدد وضعك — هذا يأتي لاحقًا. التسجيل يحميك.",
      fr: "Le premier enregistrement rapide effectué à votre arrivée. Il enregistre votre nom, date de naissance, nationalité et raison de votre venue. Il ne décide PAS de votre statut — cela vient plus tard. S'enregistrer vous protège.",
      am: "ስትደርስ የሚደረገው የመጀመሪያው ፈጣን ምዝገባ። ስምህን፣ የትውልድ ቀንህን፣ ዜግነትህን እና ለምን እንደ መጣህ ይመዘግባል። ሁኔታህን አይወስንም — ያ በኋላ ይመጣል። መመዝገብ ይጠብቅሃል።",
    },
    context: "intake",
    audience: "both",
  },
  {
    id: "trt",
    term: {
      en: "TRT — Temporary Registration Token",
      ar: "بطاقة التسجيل المؤقتة",
      fr: "TRT — Jeton d'Enregistrement Temporaire",
      am: "TRT — ጊዜያዊ የምዝገባ ቶከን",
    },
    definition: {
      en: "A paper or card given to you immediately when you arrive. It proves you have been registered and are under UNHCR's protection. Keep it safe — it is needed for receiving food, shelter, and medical care.",
      ar: "ورقة أو بطاقة تُعطى لك فور وصولك. تثبت أنك مسجل وتحت حماية المفوضية السامية للأمم المتحدة لشؤون اللاجئين. احتفظ بها في مكان آمن — فهي ضرورية للحصول على الغذاء والمأوى والرعاية الطبية.",
      fr: "Un papier ou une carte remis immédiatement à votre arrivée. Il prouve que vous avez été enregistré et êtes sous la protection du HCR. Gardez-le précieusement — il est nécessaire pour recevoir nourriture, abri et soins médicaux.",
      am: "ስትደርስ ወዲያውኑ የሚሰጥህ ወረቀት ወይም ካርድ። ተመዝግበህ ስለሆነ እና በ UNHCR ጥበቃ ስር ስለሆነ ያሳያል። በጥንቃቄ ያዘው — ለምግብ፣ ለቤት እና ለህክምና ጥቅም ላይ ያስፈልጋል።",
    },
    context: "intake",
    audience: "both",
  },
  {
    id: "primes",
    term: {
      en: "PRIMES — UNHCR Registration System",
      ar: "PRIMES — نظام التسجيل في المفوضية",
      fr: "PRIMES — Système d'Enregistrement du HCR",
      am: "PRIMES — የ UNHCR ምዝገባ ስርዓት",
    },
    definition: {
      en: "The secure database where UNHCR caseworkers record your information. Your data is protected and can only be shared with your consent or for your protection. It is not accessible to your country of origin's government.",
      ar: "قاعدة البيانات الآمنة حيث يسجل موظفو مفوضية اللاجئين معلوماتك. بياناتك محمية ولا يمكن مشاركتها إلا بموافقتك أو لحمايتك. لا يمكن الوصول إليها من قبل حكومة بلدك الأصلي.",
      fr: "La base de données sécurisée où les agents du HCR enregistrent vos informations. Vos données sont protégées et ne peuvent être partagées qu'avec votre consentement ou pour votre protection. Elle n'est pas accessible au gouvernement de votre pays d'origine.",
      am: "የ UNHCR ሠራተኞች መረጃህን የሚመዘግቡበት ደህንነቱ የተጠበቀ ዳታቤዝ። ውሂብህ የተጠበቀ ነው እና ያለ ፈቃድህ ወይም ለጥበቃህ ካልሆነ በስተቀር ሊጋራ አይችልም። ትውልድ አገርህ ሊደርስበት አይችልም።",
    },
    context: "intake, auditor",
    audience: "caseworker",
  },
  {
    id: "case_id",
    term: {
      en: "Case ID / File Number",
      ar: "رقم الملف / معرّف القضية",
      fr: "Numéro de Dossier / ID de Cas",
      am: "የጉዳይ መለያ / የፋይል ቁጥር",
    },
    definition: {
      en: "A unique number given to your household when you register. Write it down and keep it. You will need it every time you speak with a caseworker, collect assistance, or attend an interview.",
      ar: "رقم فريد يُعطى لأسرتك عند التسجيل. اكتبه واحتفظ به. ستحتاجه في كل مرة تتحدث فيها مع موظف، أو تستلم مساعدة، أو تحضر مقابلة.",
      fr: "Un numéro unique attribué à votre ménage lors de l'enregistrement. Notez-le et gardez-le. Vous en aurez besoin chaque fois que vous parlerez à un agent, collecterez de l'aide ou assisterez à un entretien.",
      am: "ስትመዘግብ ለቤተሰብህ የሚሰጥ ልዩ ቁጥር። ጻፈው እና ያዘው። ከሠራተኛ ጋር ሲነጋገሩ፣ እርዳታ ሲቀበሉ ወይም ቃለ መጠይቅ ሲሄዱ ሁሉ ያስፈልጋል።",
    },
    context: "intake",
    audience: "both",
  },
  {
    id: "group_id",
    term: {
      en: "Household / Group Registration",
      ar: "تسجيل الأسرة / المجموعة",
      fr: "Enregistrement du Ménage / Groupe",
      am: "የቤተሰብ / ቡድን ምዝገባ",
    },
    definition: {
      en: "Everyone in your immediate family — parents, children, spouse — can be registered together under one household number. Each person still gets their own record, but they are linked. Separated family members need their own registration.",
      ar: "يمكن تسجيل جميع أفراد عائلتك المباشرة — الوالدان والأطفال والزوج/الزوجة — معًا تحت رقم أسرة واحد. لكل شخص سجله الخاص، لكنهم مرتبطون. أفراد الأسرة المنفصلون يحتاجون إلى تسجيلهم الخاص.",
      fr: "Tous les membres de votre famille immédiate — parents, enfants, conjoint(e) — peuvent être enregistrés ensemble sous un numéro de ménage. Chaque personne garde son propre dossier, mais ils sont liés. Les membres de famille séparés ont besoin de leur propre enregistrement.",
      am: "ቤተሰብህ — ወላጆች፣ ልጆች፣ ትዳር አጋሮች — ሁሉም በአንድ የቤተሰብ ቁጥር ስር አብረው ሊመዘገቡ ይችላሉ። እያንዳንዱ ሰው የራሱ መዝገብ አለው፣ ነገር ግን ተያይዘዋል። ለተለያዩ የቤተሰብ አባላት የራሳቸው ምዝገባ ያስፈልጋቸዋል።",
    },
    context: "intake",
    audience: "both",
  },
  // ── ASYLUM PROCESS ────────────────────────────────────────────────────────
  {
    id: "asylum",
    term: {
      en: "Asylum / Asylum Application",
      ar: "اللجوء / طلب اللجوء",
      fr: "Asile / Demande d'Asile",
      am: "ጥገኝነት / የጥገኝነት ማመልከቻ",
    },
    definition: {
      en: "Asylum means asking a country to protect you because you cannot safely return home. An asylum application is the formal request. Making this request is your legal right — you cannot be punished for asking.",
      ar: "اللجوء يعني طلب حماية من دولة ما لأنك لا تستطيع العودة إلى وطنك بأمان. طلب اللجوء هو الطلب الرسمي. تقديم هذا الطلب حق قانوني لك — لا يمكن معاقبتك على المطالبة به.",
      fr: "L'asile signifie demander à un pays de vous protéger parce que vous ne pouvez pas rentrer chez vous en sécurité. Une demande d'asile est la demande formelle. Faire cette demande est votre droit légal — vous ne pouvez pas être puni pour l'avoir demandé.",
      am: "ጥገኝነት ማለት ወደ ቤት ደህና ሆኖ መመለስ ስለማትችል ሀገር ጥበቃ ለማግኘት መጠየቅ ማለት ነው። የጥገኝነት ማመልከቻ ይህ ኦፊሴላዊ ጥያቄ ነው። ይህን ጥያቄ ማቅረብ የህግ መብትህ ነው — ስለ ጠየቅ ሊቀጡህ አይችሉም።",
    },
    context: "intake, protection",
    audience: "both",
  },
  {
    id: "rsd",
    term: {
      en: "RSD — Refugee Status Determination",
      ar: "RSD — تحديد وضع اللاجئ",
      fr: "RSD — Détermination du Statut de Réfugié",
      am: "RSD — የስደተኛ ሁኔታ ውሳኔ",
    },
    definition: {
      en: "The formal process of deciding whether you qualify as a refugee. This involves an interview about your situation, fears, and reasons for leaving. The IER registration (step 1) comes before RSD — you will be told when your RSD interview is scheduled.",
      ar: "العملية الرسمية لتحديد ما إذا كنت مؤهلاً بوصفك لاجئًا. تتضمن مقابلة حول وضعك ومخاوفك وأسباب مغادرتك. يأتي تسجيل IER (الخطوة 1) قبل RSD — سيُخبرونك بموعد مقابلة RSD الخاصة بك.",
      fr: "Le processus formel pour décider si vous êtes qualifié comme réfugié. Cela implique un entretien sur votre situation, vos craintes et vos raisons de partir. L'enregistrement IER (étape 1) vient avant le RSD — vous serez informé quand votre entretien RSD est programmé.",
      am: "እንደ ስደተኛ ብቁ ስለሆንክ ወይም አለሆንክ ለመወሰን የሚደረግ ይፋዊ ሂደት። ስለ ሁኔታህ፣ ፍርሃቶችህ እና ለምን እንደ ሄድህ ቃለ መጠይቅ ያካትታል። IER ምዝገባ (ደረጃ 1) ከ RSD በፊት ይመጣል — የ RSD ቃለ መጠይቅህ መቼ እንደሚዘጋጅ ይነገርሃል።",
    },
    context: "protection",
    audience: "both",
  },
  {
    id: "prima_facie",
    term: {
      en: "Prima Facie Refugee",
      ar: "لاجئ من الوهلة الأولى",
      fr: "Réfugié Prima Facie",
      am: "ፕሪማ ፋሺዬ ስደተኛ",
    },
    definition: {
      en: "When a large group arrives from a country with an obvious crisis (war, mass violence), UNHCR can recognise them all as refugees without interviewing each person individually. This protects you immediately. You still receive a registration number.",
      ar: "عندما تصل مجموعة كبيرة من بلد تعاني من أزمة واضحة (حرب، عنف جماعي)، يمكن للمفوضية الاعتراف بهم جميعًا كلاجئين دون مقابلة كل شخص على حدة. هذا يحميك فورًا. لا تزال تتلقى رقم تسجيل.",
      fr: "Lorsqu'un grand groupe arrive d'un pays avec une crise évidente (guerre, violence de masse), le HCR peut les reconnaître tous comme réfugiés sans interviewer chaque personne individuellement. Cela vous protège immédiatement. Vous recevez quand même un numéro d'enregistrement.",
      am: "ግልጽ ቀውስ (ጦርነት፣ የጅምላ ጥቃት) ካለበት ሀገር ትልቅ ቡድን ሲደርስ፣ UNHCR እያንዳንዱን ሰው ሳያናግር ሁሉንም እንደ ስደተኞች ሊለይ ይችላል። ይህ ወዲያውኑ ይጠብቅሃል። አሁንም የምዝገባ ቁጥር ታገኛለህ።",
    },
    context: "protection",
    audience: "both",
  },
  {
    id: "mandate_refugee",
    term: {
      en: "Mandate Refugee",
      ar: "لاجئ تحت تفويض المفوضية",
      fr: "Réfugié sous mandat",
      am: "ማንዴት ስደተኛ",
    },
    definition: {
      en: "A person recognised as a refugee directly by UNHCR, rather than by a government. This usually happens in countries without their own asylum system. Your UNHCR recognition letter is important proof of your status.",
      ar: "شخص معترف به كلاجئ مباشرةً من قبل المفوضية السامية للأمم المتحدة لشؤون اللاجئين، وليس من قبل حكومة. يحدث هذا عادةً في البلدان التي ليس لديها نظام لجوء خاص بها. خطاب الاعتراف من المفوضية هو دليل مهم على وضعك.",
      fr: "Une personne reconnue comme réfugié directement par le HCR, plutôt que par un gouvernement. Cela se produit généralement dans des pays sans leur propre système d'asile. Votre lettre de reconnaissance du HCR est une preuve importante de votre statut.",
      am: "ከ UNHCR ቀጥታ እንደ ስደተኛ እውቅና የተሰጠው ሰው፣ ከመንግስት ሳይሆን። ይህ ብዙ ጊዜ የራሳቸው ጥገኝነት ስርዓት የሌላቸው ሀገሮች ውስጥ ይከሰታል። የ UNHCR እውቅና ደብዳቤ ስለ ሁኔታህ ጠቃሚ ማስረጃ ነው።",
    },
    context: "protection",
    audience: "both",
  },
  {
    id: "stateless",
    term: {
      en: "Stateless Person",
      ar: "عديم الجنسية",
      fr: "Apatride",
      am: "ዜግነት የሌለው ሰው",
    },
    definition: {
      en: "Someone who is not considered a citizen of any country. Stateless people often have no passport and face serious difficulties accessing services. UNHCR also protects stateless people — tell your caseworker if you have no nationality documents.",
      ar: "شخص لا تعتبره أي دولة مواطنًا. يفتقر الأشخاص عديمو الجنسية في كثير من الأحيان إلى جوازات السفر ويواجهون صعوبات جسيمة في الوصول إلى الخدمات. تحمي المفوضية أيضًا عديمي الجنسية — أخبر موظفك إذا لم يكن لديك وثائق جنسية.",
      fr: "Quelqu'un qui n'est pas considéré comme citoyen d'aucun pays. Les apatrides n'ont souvent pas de passeport et rencontrent de sérieuses difficultés pour accéder aux services. Le HCR protège également les apatrides — dites à votre agent si vous n'avez pas de documents de nationalité.",
      am: "የየትኛውም ሀገር ዜጋ ያልሆነ ሰው። ዜግነት ለሌላቸው ሰዎች ብዙ ጊዜ ፓስፖርት የለም እና አገልግሎቶች ለማግኘት ከባድ ችግሮች ይጋፈጣሉ። UNHCR ዜግነት ለሌላቸው ሰዎችም ይጠብቃል — የዜግነት ሰነዶች ከሌለህ ሠራተኛህን ንገረው።",
    },
    context: "intake, protection",
    audience: "both",
  },
  // ── DOCUMENTATION ─────────────────────────────────────────────────────────
  {
    id: "cor",
    term: {
      en: "Country of Origin / Country of Habitual Residence",
      ar: "بلد المنشأ / بلد الإقامة المعتادة",
      fr: "Pays d'Origine / Pays de Résidence Habituelle",
      am: "ትውልድ አገር / የተለመደ መኖሪያ አገር",
    },
    definition: {
      en: "The country you lived in before fleeing — usually your nationality country. If you lived somewhere else for many years, that is your 'country of habitual residence'. You must declare this honestly during registration.",
      ar: "البلد الذي عشت فيه قبل الفرار — عادةً بلد جنسيتك. إذا عشت في مكان آخر لسنوات عديدة، فهذا 'بلد إقامتك المعتادة'. يجب أن تُصرّح بهذا بصدق أثناء التسجيل.",
      fr: "Le pays dans lequel vous viviez avant de fuir — généralement votre pays de nationalité. Si vous avez vécu ailleurs pendant de nombreuses années, c'est votre 'pays de résidence habituelle'. Vous devez déclarer cela honnêtement lors de l'enregistrement.",
      am: "ሸሽተህ ከመምጣትህ በፊት ትኖርበት የነበረው ሀገር — ብዙ ጊዜ ዜግነትህ ያለው ሀገር። ለብዙ ዓመታት በሌላ ቦታ ኖረህ ከሆነ፣ ያ 'የተለመደ መኖሪያ አገርህ' ነው። ምዝገባ ወቅት ይህን በቅንነት ማሳወቅ አለብህ።",
    },
    context: "intake",
    audience: "both",
  },
  {
    id: "place_of_origin",
    term: {
      en: "Place of Origin",
      ar: "مكان المنشأ",
      fr: "Lieu d'Origine",
      am: "የትውልድ ቦታ",
    },
    definition: {
      en: "The specific town, village, or region you came from — not just the country. This is important for dossier reconstruction. Say it clearly and spell it out if needed. Even partial or uncertain information is recorded.",
      ar: "المدينة أو القرية أو المنطقة المحددة التي أتيت منها — وليس فقط الدولة. هذا مهم لإعادة بناء الملف. قله بوضوح واكتبه إذا لزم الأمر. حتى المعلومات الجزئية أو غير المؤكدة يتم تسجيلها.",
      fr: "La ville, le village ou la région spécifique d'où vous venez — pas seulement le pays. C'est important pour la reconstruction du dossier. Dites-le clairement et épelezle si nécessaire. Même les informations partielles ou incertaines sont enregistrées.",
      am: "ከሚለው ሀገር ሳይሆን ከጠቆምህ ከተማ፣ መንደር ወይም ክልል። ይህ ፋይልን ለማደስ ጠቃሚ ነው። ግልጽ ብለህ ተናገር እና አስፈላጊ ከሆነ ፊደሎቹን ጥቀስ። ከፊል ወይም እርግጠኛ ያልሆነ መረጃ እንኳ ይመዘገባል።",
    },
    context: "intake",
    audience: "both",
  },
  {
    id: "missing_docs",
    term: {
      en: "Missing or Damaged Documents",
      ar: "وثائق مفقودة أو تالفة",
      fr: "Documents Manquants ou Endommagés",
      am: "የጠፉ ወይም የተበላሹ ሰነዶች",
    },
    definition: {
      en: "You can be registered even if you have no documents, or only partial or damaged ones. Caseworkers are trained to work with fragments. Tell the caseworker what happened to your documents — lost at border, confiscated, destroyed. Your testimony counts as evidence.",
      ar: "يمكن تسجيلك حتى لو لم يكن لديك وثائق، أو كانت لديك وثائق جزئية أو تالفة فقط. الموظفون مدربون على العمل مع الأجزاء. أخبر الموظف بما حدث لوثائقك — ضاعت عند الحدود، أو صودرت، أو أتلفت. شهادتك تُعد دليلاً.",
      fr: "Vous pouvez être enregistré même si vous n'avez pas de documents, ou seulement des documents partiels ou endommagés. Les agents sont formés pour travailler avec des fragments. Dites à l'agent ce qui est arrivé à vos documents — perdus à la frontière, confisqués, détruits. Votre témoignage est une preuve.",
      am: "ሰነዶች ካልኖሩህ፣ ወይም ከፊሎቹ ወይም የተበሳሹ ካሉ ብቻ እንኳ ልትመዘገብ ትችላለህ። ሠራተኞች ቁርጥራጮቻችን ጋር ለመስራት ሠልጥነዋል። ሠራተኛህን ስለ ሰነዶቼ ምን እንደ ሆነ ንገረው — ድንበር ላይ ጠፋ፣ ተወሰደ፣ ወሀደቀ። ምስክርነትህ ማስረጃ ሆኖ ይቆጠራል።",
    },
    context: "intake",
    audience: "both",
  },
  // ── CASEWORKER TOOLS / PROCESS ────────────────────────────────────────────
  {
    id: "constitutional_auditor",
    term: {
      en: "Constitutional Auditor (Safety Check)",
      ar: "المدقق الدستوري (فحص الأمان)",
      fr: "Auditeur Constitutionnel (Vérification de Sécurité)",
      am: "ሕገ-መንግስታዊ ኦዲተር (የደህንነት ምርመራ)",
    },
    definition: {
      en: "An automatic safety check that reviews every record before it is saved. It blocks any sensitive information (such as political beliefs or religion) from being recorded — these fields are legally prohibited from refugee intake records. The caseworker sees a warning chip if something is blocked.",
      ar: "فحص أمان تلقائي يراجع كل سجل قبل حفظه. يمنع تسجيل أي معلومات حساسة (مثل المعتقدات السياسية أو الدين) — هذه الحقول محظورة قانونًا من سجلات استقبال اللاجئين. يرى الموظف رقاقة تحذير إذا تم حظر شيء ما.",
      fr: "Une vérification automatique de sécurité qui examine chaque dossier avant qu'il soit enregistré. Elle bloque toute information sensible (comme les convictions politiques ou la religion) d'être enregistrée — ces champs sont légalement interdits des dossiers d'accueil des réfugiés. L'agent voit une puce d'avertissement si quelque chose est bloqué.",
      am: "ከመቀመጡ በፊት እያንዳንዱን መዝገብ የሚፈትሽ ራስ-ሰር የደህንነት ምርመራ። ማንኛውም ሚስጥራዊ መረጃ (እንደ ፖለቲካ እምነቶች ወይም ሃይማኖት) ከተቀመጠ ይከለክላል — እነዚህ መስኮች ሕጋዊ ከሆነ ስደተኛ ቅበላ መዝገቦች የተከለከሉ ናቸው። ሆኖ ነገር ቢከለከል ሠራተኛው የማስጠንቀቂያ ቺፕ ያያል።",
    },
    context: "auditor",
    audience: "caseworker",
  },
  {
    id: "dignity_loop",
    term: {
      en: "Dignity Loop — Record Confirmation",
      ar: "حلقة الكرامة — تأكيد السجل",
      fr: "Boucle de Dignité — Confirmation du Dossier",
      am: "የክብር ሉፕ — የመዝገብ ማረጋገጫ",
    },
    definition: {
      en: "Before your record is saved, the caseworker reads it back to you in your language. You can correct any mistake. Your agreement is required before the record is finalised. This protects your right to accurate documentation.",
      ar: "قبل حفظ سجلك، يقرأه الموظف عليك بلغتك. يمكنك تصحيح أي خطأ. موافقتك مطلوبة قبل إنهاء السجل. هذا يحمي حقك في التوثيق الدقيق.",
      fr: "Avant que votre dossier soit enregistré, l'agent vous le relit dans votre langue. Vous pouvez corriger toute erreur. Votre accord est requis avant que le dossier soit finalisé. Cela protège votre droit à une documentation précise.",
      am: "መዝገብህ ከመቀመጡ በፊት ሠራተኛው በቋንቋህ ያነብልሃል። ማናቸውንም ስህተት ማስተካከል ትችላለህ። መዝገቡ ከመጠናቀቁ በፊት ስምምነትህ ያስፈልጋል። ይህ ትክክለኛ ሰነድ የማግኘት መብትህን ይጠብቃል።",
    },
    context: "intake, protection",
    audience: "both",
  },
  {
    id: "data_minimization",
    term: {
      en: "Data Minimisation — What We Record",
      ar: "الحد الأدنى من البيانات — ما نسجله",
      fr: "Minimisation des Données — Ce Que Nous Enregistrons",
      am: "ዝቅተኛ ውሂብ — የምንመዘግበው",
    },
    definition: {
      en: "We only collect the minimum information needed to protect you and provide services. We do NOT record your political opinions, religion, sexual orientation, or ethnicity. If a caseworker asks for this information, you have the right to refuse.",
      ar: "نجمع فقط الحد الأدنى من المعلومات اللازمة لحمايتك وتقديم الخدمات. لا نسجل آراءك السياسية أو دينك أو توجهك الجنسي أو عرقك. إذا طلب منك موظف هذه المعلومات، فلديك الحق في الرفض.",
      fr: "Nous collectons uniquement les informations minimales nécessaires pour vous protéger et fournir des services. Nous n'enregistrons PAS vos opinions politiques, religion, orientation sexuelle ou ethnicité. Si un agent vous demande ces informations, vous avez le droit de refuser.",
      am: "ለጥበቃህ እና ለአገልግሎቶች አስፈላጊ የሆነውን ዝቅተኛ መረጃ ብቻ እንሰበስባለን። የፖለቲካ አስተሳሰቦችህን፣ ሃይማኖትህን፣ ወሲባዊ አቅጣጫህን ወይም ዘርህን አንመዘግብም። ሠራተኛ ይህን መረጃ ቢጠይቅ የመቃወም መብት አለህ።",
    },
    legal_reference: "UNHCR Data Protection Policy",
    context: "auditor, protection, intake",
    audience: "both",
  },
  {
    id: "informed_consent",
    term: {
      en: "Informed Consent",
      ar: "الموافقة المستنيرة",
      fr: "Consentement Éclairé",
      am: "በእውቀት ላይ የተመሰረተ ስምምነት",
    },
    definition: {
      en: "Before we record your information, we explain: what we are collecting, why, who will see it, and your rights. You must agree freely — not because you are afraid or pressured. You can ask questions before agreeing.",
      ar: "قبل تسجيل معلوماتك، نشرح: ما الذي نجمعه، ولماذا، ومن سيراه، وحقوقك. يجب أن توافق بحرية — وليس لأنك خائف أو تحت ضغط. يمكنك طرح الأسئلة قبل الموافقة.",
      fr: "Avant d'enregistrer vos informations, nous expliquons : ce que nous collectons, pourquoi, qui le verra, et vos droits. Vous devez accepter librement — pas parce que vous avez peur ou êtes sous pression. Vous pouvez poser des questions avant d'accepter.",
      am: "መረጃህን ከምንመዘግብ በፊት፡ የምንሰበስበው ምን ነው፣ ለምን፣ ማን ያያል እና መብቶችህ ምን ናቸው ብለን እናስረዳለን። ስለ ፍርሀት ወይም ግፊት ሳይሆን በነፃ ፈቃደኝነት ማለህ ያስፈልጋል። ከስምምነትህ በፊት ጥያቄ ልትጠይቅ ትችላለህ።",
    },
    context: "intake, protection",
    audience: "both",
  },
  // ── PROTECTION & VULNERABILITY ────────────────────────────────────────────
  {
    id: "protection_concern",
    term: {
      en: "Protection Concern",
      ar: "مخاوف الحماية",
      fr: "Préoccupation de Protection",
      am: "የጥበቃ ስጋት",
    },
    definition: {
      en: "A specific risk to your safety that a caseworker flags for urgent follow-up. Examples: you are a minor alone, you have a medical emergency, you were a victim of violence, or your life is at immediate risk. If flagged, a senior caseworker reviews your case faster.",
      ar: "خطر محدد على سلامتك يُشير إليه الموظف لمتابعة عاجلة. أمثلة: أنت قاصر بمفردك، لديك حالة طوارئ طبية، كنت ضحية عنف، أو حياتك في خطر فوري. إذا تم الإشارة إليه، يراجع موظف أول قضيتك بشكل أسرع.",
      fr: "Un risque spécifique pour votre sécurité qu'un agent signale pour un suivi urgent. Exemples : vous êtes un mineur seul, vous avez une urgence médicale, vous avez été victime de violence, ou votre vie est en danger immédiat. Si signalé, un agent principal examine votre cas plus rapidement.",
      am: "ሠራተኛ ለአስቸኳይ ክትትል የሚያስምርበት ለደህንነትህ የሚሆን ጠቃሚ ስጋት። ምሳሌዎች፡ ብቻህን ቅድምና ክህደት ያጋጠመህ ልጅ ነህ፣ ሕክምናዊ አስቸኳይ ሁኔታ አለህ፣ የጥቃት ሰለባ ሆነህ ነበር፣ ወይም ሕይወትህ ወዲያውኑ አደጋ ላይ ናት። ምልክቱ ካለ፣ ከፍተኛ ሠራተኛ ጉዳይህን ፈጥኖ ይፈትሻል።",
    },
    context: "protection",
    audience: "caseworker",
  },
  {
    id: "uasc",
    term: {
      en: "UASC — Unaccompanied / Separated Child",
      ar: "طفل غير مصحوب / مفصول",
      fr: "UASC — Enfant Non-Accompagné / Séparé",
      am: "UASC — ያለ አዋቂ ጠባቂ ወይም ከቤተሰብ የተለየ ሕፃን",
    },
    definition: {
      en: "A child under 18 who arrived without a parent or legal guardian, or was separated from their family. UASC cases are handled with urgent priority. Immediate referral to child protection is required — caseworkers must flag this at intake.",
      ar: "طفل دون 18 عامًا وصل بدون أحد والديه أو وصيه القانوني، أو فُصل عن عائلته. تُعالج قضايا UASC بأولوية عاجلة. الإحالة الفورية إلى حماية الطفل مطلوبة — يجب على الموظفين الإشارة إلى ذلك عند الاستقبال.",
      fr: "Un enfant de moins de 18 ans arrivé sans parent ni tuteur légal, ou séparé de sa famille. Les cas UASC sont traités en priorité urgente. Un renvoi immédiat à la protection de l'enfance est requis — les agents doivent le signaler à l'accueil.",
      am: "ያለ ወላጅ ወይም ሕጋዊ አሳዳጊ ወይም ከቤተሰቡ ተለይቶ የደረሰ ከ18 ዓመት በታች ሕፃን። UASC ጉዳዮች አስቸኳይ ቅድሚያ ተሰጥቶ ይስተናገዳሉ። ወዲያውኑ ወደ የሕፃናት ጥበቃ ሊተላለፍ ይገባዋል — ሠራተኞቹ ይህን በቅበላ ጊዜ ሊያስምሩ ይገባቸዋል።",
    },
    context: "intake, protection",
    audience: "both",
  },
  {
    id: "family_tracing",
    term: {
      en: "Family Tracing",
      ar: "تتبع الأسرة",
      fr: "Recherche de Famille",
      am: "የቤተሰብ ፍለጋ",
    },
    definition: {
      en: "If family members were separated during your journey, organisations like ICRC (Red Cross) and UNHCR can help find them. Registering gives them a way to find you too. Ask your caseworker to open a family tracing case.",
      ar: "إذا انفصل أفراد الأسرة خلال رحلتك، يمكن لمنظمات مثل الصليب الأحمر الدولي والمفوضية مساعدتك في العثور عليهم. التسجيل يمنحهم طريقة للعثور عليك أيضًا. اطلب من موظفك فتح قضية تتبع أسرة.",
      fr: "Si des membres de votre famille ont été séparés pendant votre voyage, des organisations comme le CICR (Croix-Rouge) et le HCR peuvent aider à les retrouver. S'enregistrer leur donne aussi un moyen de vous retrouver. Demandez à votre agent d'ouvrir un dossier de recherche de famille.",
      am: "በጉዞህ ወቅት የቤተሰብ አባላት ተለያይተው ከሆነ፣ እንደ ICRC (ቀይ መስቀል) እና UNHCR ያሉ ድርጅቶች እነሱን ለማግኘት ሊረዱ ይችላሉ። መመዝገቡ እነሱ ደግሞ አንተን ለማግኘት መንገድ ይሰጣቸዋል። ሠራተኛህን የቤተሰብ ፍለጋ ጉዳይ ለመክፈት ጠይቅ።",
    },
    context: "protection",
    audience: "both",
  },
  // ── ASSISTANCE & SERVICES ─────────────────────────────────────────────────
  {
    id: "nfi",
    term: {
      en: "NFI — Non-Food Items",
      ar: "المواد غير الغذائية",
      fr: "NFI — Articles Non Alimentaires",
      am: "NFI — ምግብ ያልሆኑ ዕቃዎች",
    },
    definition: {
      en: "Basic essential items that are not food — blankets, clothing, jerrycans, cooking pots, soap. Distributed by UNHCR or WFP partner organisations. Your registration number is needed to collect these.",
      ar: "العناصر الأساسية الضرورية التي ليست غذاءً — البطانيات والملابس وجالونات المياه وأواني الطهي والصابون. توزعها المفوضية أو منظمات الشريكة. رقم تسجيلك مطلوب لاستلامها.",
      fr: "Articles essentiels de base qui ne sont pas de la nourriture — couvertures, vêtements, jerricanes, casseroles, savon. Distribués par le HCR ou les organisations partenaires du PAM. Votre numéro d'enregistrement est nécessaire pour les collecter.",
      am: "ምግብ ያልሆኑ መሠረታዊ ዕቃዎች — ብርድ ልብሶች፣ ልብሶች፣ ጃሪካኖች፣ የምግብ ዕቃዎች፣ ሳሙና። UNHCR ወይም WFP አጋር ድርጅቶች ያሰራጫሉ። እነዚህን ለመሰብሰብ የምዝገባ ቁጥርህ ያስፈልጋል።",
    },
    context: "intake",
    audience: "both",
  },
  {
    id: "medical_referral",
    term: {
      en: "Medical Referral",
      ar: "الإحالة الطبية",
      fr: "Référence Médicale",
      am: "ሕክምናዊ ሪፈራል",
    },
    definition: {
      en: "A written note from a caseworker or health worker that sends you to a specific clinic or hospital for treatment. Keep your referral slip — without it, the health facility may not see you. Tell your caseworker if you or a family member has an urgent health need during intake.",
      ar: "ملاحظة مكتوبة من موظف أو عامل صحي ترسلك إلى عيادة أو مستشفى معين للعلاج. احتفظ بورقة الإحالة — بدونها قد لا تراك المنشأة الصحية. أخبر موظفك إذا كان لديك أنت أو أحد أفراد عائلتك احتياج صحي عاجل أثناء الاستقبال.",
      fr: "Une note écrite d'un agent ou d'un professionnel de santé qui vous envoie à une clinique ou un hôpital spécifique pour un traitement. Gardez votre fiche de référence — sans elle, l'établissement de santé peut ne pas vous voir. Dites à votre agent si vous ou un membre de votre famille avez un besoin médical urgent lors de l'accueil.",
      am: "ለህክምና ወደ ሆስፒታሉ ወይም ክሊኒክ የሚልክ ሠራተኛ ወይም ጤና ሠራተኛ የሰጠ የጽሁፍ ደብዳቤ። የሪፈራል ወረቀቱን ያዝ — ያለ ሪፈራል ጤና ተቋሙ ላይቀበልህ ይችላል። ቅበላ ወቅት አንተ ወይም የቤተሰቡ አባል አስቸኳይ ጤና ፍላጎት ካለህ ሠራተኛህን ንገረው።",
    },
    context: "intake, protection",
    audience: "both",
  },
  {
    id: "wfp_food",
    term: {
      en: "WFP Food Assistance",
      ar: "المساعدات الغذائية لبرنامج الأغذية العالمي",
      fr: "Aide Alimentaire du PAM",
      am: "WFP የምግብ እርዳታ",
    },
    definition: {
      en: "The World Food Programme (WFP) provides food rations or cash vouchers for registered refugees. Distribution points and schedules are posted at the reception site. You need your registration number and TRT card to collect food assistance.",
      ar: "يوفر برنامج الأغذية العالمي حصصًا غذائية أو قسائم نقدية للاجئين المسجلين. يتم نشر نقاط التوزيع والجداول في موقع الاستقبال. تحتاج إلى رقم تسجيلك وبطاقة TRT لاستلام مساعدات الغذاء.",
      fr: "Le Programme Alimentaire Mondial (PAM) fournit des rations alimentaires ou des bons en espèces pour les réfugiés enregistrés. Les points de distribution et les horaires sont affichés au site d'accueil. Vous avez besoin de votre numéro d'enregistrement et de votre carte TRT pour collecter l'aide alimentaire.",
      am: "የዓለም ምግብ ፕሮግራም (WFP) ለተመዘገቡ ስደተኞች የምግብ ድርሻ ወይም የጥሬ ገንዘብ ቫውቸር ይሰጣል። ያሰራጫቸው ቦታዎች እና የጊዜ ሰሌዳዎች በቅበላ ቦታ ይለጠፋሉ። የምግብ እርዳታ ለመሰብሰብ የምዝገባ ቁጥርህ እና TRT ካርዱ ያስፈልጋሉ።",
    },
    context: "intake",
    audience: "both",
  },
  // ── DURABLE SOLUTIONS ─────────────────────────────────────────────────────
  {
    id: "durable_solutions",
    term: {
      en: "Durable Solutions",
      ar: "الحلول الدائمة",
      fr: "Solutions Durables",
      am: "ዘላቂ መፍትሄዎች",
    },
    definition: {
      en: "The three official pathways out of displacement: (1) Voluntary Return — going home when it is safe; (2) Local Integration — building a life in the country where you are now; (3) Resettlement — moving to a third country. UNHCR decides eligibility. This process takes years — registration now is the first step.",
      ar: "المسارات الرسمية الثلاثة للخروج من التهجير: (1) العودة الطوعية — العودة إلى الوطن عندما تصبح آمنة؛ (2) الاندماج المحلي — بناء حياة في البلد الذي أنت فيه الآن؛ (3) إعادة التوطين — الانتقال إلى دولة ثالثة. تحدد المفوضية الأهلية. هذه العملية تستغرق سنوات — التسجيل الآن هو الخطوة الأولى.",
      fr: "Les trois voies officielles pour sortir du déplacement : (1) Retour volontaire — rentrer chez soi quand c'est sûr ; (2) Intégration locale — construire une vie dans le pays où vous êtes maintenant ; (3) Réinstallation — déménager dans un pays tiers. Le HCR décide de l'éligibilité. Ce processus prend des années — s'enregistrer maintenant est la première étape.",
      am: "ከመፈናቀል ወጥቶ ለመኖር ሦስቱ ይፋዊ መንገዶች፡ (1) በፈቃደኝነት መመለስ — ደህና ሲሆን ወደ ቤት መሄድ; (2) አካባቢያዊ ውህደት — አሁን ባለህበት ሀገር ሕይወት መሥራት; (3) ዳግም ሰፈራ — ወደ ሦስተኛ ሀገር መዛወር። UNHCR ብቁነትን ይወስናል። ይህ ሂደት ዓመታት ይወስዳል — አሁን መመዝገብ የመጀመሪያው ደረጃ ነው።",
    },
    context: "protection",
    audience: "both",
  },
  {
    id: "resettlement",
    term: {
      en: "Resettlement",
      ar: "إعادة التوطين",
      fr: "Réinstallation",
      am: "ዳግም ሰፈራ",
    },
    definition: {
      en: "Being transferred to a third country (e.g. Canada, Germany, USA) that agrees to give you permanent status. Resettlement is rare — only about 1% of refugees are resettled each year. You cannot apply directly; UNHCR nominates cases based on vulnerability. Beware of anyone who claims they can get you resettled for money.",
      ar: "نقلك إلى دولة ثالثة (مثل كندا أو ألمانيا أو الولايات المتحدة) توافق على منحك وضعًا دائمًا. إعادة التوطين نادرة — حوالي 1% فقط من اللاجئين يُعاد توطينهم كل عام. لا يمكنك التقدم مباشرةً؛ تُرشح المفوضية الحالات بناءً على الضعف. احذر من أي شخص يدّعي أنه يستطيع إعادة توطينك مقابل المال.",
      fr: "Être transféré dans un pays tiers (p. ex. Canada, Allemagne, États-Unis) qui accepte de vous donner un statut permanent. La réinstallation est rare — seulement environ 1% des réfugiés sont réinstallés chaque année. Vous ne pouvez pas postuler directement ; le HCR nomme des cas en fonction de la vulnérabilité. Méfiez-vous de quiconque prétend pouvoir vous faire réinstaller contre de l'argent.",
      am: "ቋሚ ሁኔታ ለመስጠት ወደ ሦስተኛ ሀገር (ለምሳሌ ካናዳ፣ ጀርመን፣ አሜሪካ) ማዛወር። ዳግም ሰፈራ ጥቂት ነው — በዓመት ከ1% ስደተኞች ብቻ ዳግም ይሰፍራሉ። ቀጥታ ማመልከት አትችልም; UNHCR ተጋላጭነት ላይ ተመስርቶ ጉዳዮችን ይሰይማል። ለገንዘብ ዳግም ሊሰፍሩህ ይችላሉ ብለው ሊነሳሱህ ስለሚሞክሩ ሰዎች ጥንቃቄ አድርግ።",
    },
    context: "protection",
    audience: "both",
  },
  // ── TECHNOLOGY / GEMMA TERMS ──────────────────────────────────────────────
  {
    id: "gemma_scout",
    term: {
      en: "Gemma Scout (E2B) — Fast AI Model",
      ar: "جيما سكاوت (E2B) — نموذج الذكاء الاصطناعي السريع",
      fr: "Gemma Scout (E2B) — Modèle IA Rapide",
      am: "Gemma Scout (E2B) — ፈጣን AI ሞዴል",
    },
    definition: {
      en: "Gemma 4 E2B is a 2-billion parameter AI model that runs directly on this device (Raspberry Pi 5) without any internet connection. It handles fast tasks: pre-processing documents, checking for dialect triage, building the glossary, and the Constitutional Auditor's first check. Typical response: under 1 second.",
      ar: "Gemma 4 E2B هو نموذج ذكاء اصطناعي بمليارَي معامل يعمل مباشرةً على هذا الجهاز (Raspberry Pi 5) دون أي اتصال بالإنترنت. يتعامل مع المهام السريعة: معالجة الوثائق مسبقًا، والتحقق من فرز اللهجات، وبناء المصطلحات، والتحقق الأول للمدقق الدستوري. الاستجابة النموذجية: أقل من ثانية.",
      fr: "Gemma 4 E2B est un modèle d'IA à 2 milliards de paramètres qui fonctionne directement sur cet appareil (Raspberry Pi 5) sans aucune connexion Internet. Il gère les tâches rapides : pré-traitement des documents, vérification du tri dialectal, construction du glossaire et premier contrôle de l'auditeur constitutionnel. Réponse typique : moins d'une seconde.",
      am: "Gemma 4 E2B ምንም የኢንተርኔት ግንኙነት ሳያስፈልግ በቀጥታ በዚህ መሣሪያ (Raspberry Pi 5) ላይ ሚሰራ 2 ቢሊዮን ፓራሜትር AI ሞዴል ነው። ፈጣን ሥራዎችን ያስተናግዳል፡ ሰነዶችን ቅድሚያ ማስተናገድ፣ የቀበሌኛ ምደባ ምርመራ፣ ቃላቶቹን መገንባት፣ እና የሕገ-መንግስታዊ ኦዲተር የመጀመሪያ ምርመራ። ዓይነተኛ ምላሽ፡ ከአንድ ሰከንድ ያነሰ።",
    },
    context: "intake, auditor",
    audience: "caseworker",
  },
  {
    id: "gemma_analyst",
    term: {
      en: "Gemma Analyst (E4B) — Deep Reasoning Model",
      ar: "جيما أناليست (E4B) — نموذج التفكير العميق",
      fr: "Gemma Analyst (E4B) — Modèle de Raisonnement Approfondi",
      am: "Gemma Analyst (E4B) — ጥልቅ ምክንያት AI ሞዴል",
    },
    definition: {
      en: "Gemma 4 E4B is a 4-billion parameter model that handles complex tasks: synthesising information across all documents and audio, detecting conflicts between sources, generating the dignity loop summary, and running the full auditor review. Runs entirely offline on Raspberry Pi 5. Response: 4–15 seconds.",
      ar: "Gemma 4 E4B هو نموذج بأربعة مليارات معامل يتعامل مع المهام المعقدة: تجميع المعلومات عبر جميع الوثائق والصوت، واكتشاف التعارضات بين المصادر، وإنشاء ملخص حلقة الكرامة، وإجراء مراجعة المدقق الكاملة. يعمل بالكامل بدون اتصال على Raspberry Pi 5. الاستجابة: 4–15 ثانية.",
      fr: "Gemma 4 E4B est un modèle à 4 milliards de paramètres qui gère les tâches complexes : synthétiser les informations de tous les documents et audio, détecter les conflits entre les sources, générer le résumé de la boucle de dignité et effectuer la revue complète de l'auditeur. Fonctionne entièrement hors ligne sur Raspberry Pi 5. Réponse : 4–15 secondes.",
      am: "Gemma 4 E4B ውስብስብ ሥራዎችን የሚያስተናግድ 4 ቢሊዮን ፓራሜትር ሞዴል ነው፡ ከሁሉም ሰነዶች እና ኦዲዮ ብዙ መረጃ ማዋሀድ፣ ምንጮች መካከል ግጭቶችን ማወቅ፣ የክብር ሉፕ ማጠቃለያ ማዘጋጀት፣ እና ሙሉ ኦዲተር ምርመራ ማካሄድ። በ Raspberry Pi 5 ሙሉ ለሙሉ ያለ ኢንተርኔት ይሰራል። ምላሽ፡ 4–15 ሰከንዶች።",
    },
    context: "intake, auditor",
    audience: "caseworker",
  },
  {
    id: "cross_modal",
    term: {
      en: "Cross-Modal Conflict — Document vs Testimony",
      ar: "التعارض بين الوسائط — الوثيقة مقابل الشهادة",
      fr: "Conflit Cross-Modal — Document vs Témoignage",
      am: "ብዙ-ሚዲያ ግጭት — ሰነድ vs ምስክርነት",
    },
    definition: {
      en: "When information from two sources disagrees — for example, the passport says 2016 but the audio testimony says 2017. Globis Edge flags these automatically and shows the caseworker exactly where they disagree. The caseworker verifies with the person — the system never auto-resolves conflicts.",
      ar: "عندما تختلف المعلومات من مصدرين — على سبيل المثال، جواز السفر يقول 2016 لكن الشهادة الصوتية تقول 2017. تُشير Globis Edge إلى هذه تلقائيًا وتُظهر للموظف أين يختلفان بالضبط. يتحقق الموظف من الشخص — النظام لا يحل التعارضات تلقائيًا أبدًا.",
      fr: "Quand les informations de deux sources ne concordent pas — par exemple, le passeport dit 2016 mais le témoignage audio dit 2017. Globis Edge signale ces cas automatiquement et montre à l'agent exactement où ils divergent. L'agent vérifie avec la personne — le système ne résout jamais automatiquement les conflits.",
      am: "ከሁለት ምንጮች መረጃ ሲቃቃር — ለምሳሌ፣ ፓስፖርቱ 2016 ሲል ኦዲዮ ምስክርነቱ 2017 ይላል። Globis Edge እነዚህን ራስ-ሰር ያሳያል እና ሠራተኛው ትክክለኛ ቦታቸው ያሳያቸዋል። ሠራተኛው ከሰዎ ጋር ያረጋግጣል — ስርዓቱ ግጭቶችን ራስ-ሰር ፈፅሞ አይፈታም።",
    },
    context: "auditor, intake",
    audience: "caseworker",
  },
  {
    id: "piper_tts",
    term: {
      en: "Piper TTS — On-Device Voice",
      ar: "Piper TTS — الصوت على الجهاز",
      fr: "Piper TTS — Voix Sur Appareil",
      am: "Piper TTS — በመሣሪያ ላይ ድምፅ",
    },
    definition: {
      en: "The text-to-speech engine that reads the dignity loop summary aloud in the refugee's language. It runs on the Pi 5 with no internet. Supported languages: English, Arabic (MSA), French, Amharic. For Masalit, Fur, Zaghawa — a human interpreter is required instead.",
      ar: "محرك تحويل النص إلى كلام الذي يقرأ ملخص حلقة الكرامة بصوت عالٍ بلغة اللاجئ. يعمل على Pi 5 بدون إنترنت. اللغات المدعومة: الإنجليزية والعربية (الفصحى) والفرنسية والأمهرية. للماساليت والفور والزغاوة — يلزم مترجم بشري بدلاً من ذلك.",
      fr: "Le moteur de synthèse vocale qui lit le résumé de la boucle de dignité à voix haute dans la langue du réfugié. Il fonctionne sur le Pi 5 sans internet. Langues prises en charge : anglais, arabe (MSA), français, amharique. Pour le masalit, le fur, le zaghawa — un interprète humain est requis à la place.",
      am: "የስደተኛን ቋንቋ ሊዲ ሉፕ ማጠቃለያ ጮክ ብሎ የሚያነብ የጽሑፍ-ወደ-ድምፅ ሞተር። ያለ ኢንተርኔት Pi 5 ላይ ይሰራል። የሚደገፉ ቋንቋዎች፡ እንግሊዝኛ፣ አረብኛ (MSA)፣ ፈረንሳይኛ፣ አማርኛ። ለ Masalit፣ Fur፣ Zaghawa — ሰው አስተርጓሚ ያስፈልጋል።",
    },
    context: "intake",
    audience: "caseworker",
  },
  // ── COUNTRY / PROCESS SPECIFIC ────────────────────────────────────────────
  {
    id: "bamf",
    term: {
      en: "BAMF — German Asylum Authority",
      ar: "BAMF — مكتب الهجرة واللاجئين الفيدرالي الألماني",
      fr: "BAMF — Office Fédéral Allemand des Migrations",
      am: "BAMF — የጀርመን ጥገኝነት ባለስልጣን",
    },
    definition: {
      en: "Bundesamt für Migration und Flüchtlinge — the German Federal Office for Migration and Refugees. Responsible for processing asylum applications in Germany. After initial registration, BAMF will schedule your formal asylum interview (Anhörung). You have the right to an interpreter and a lawyer during this process.",
      ar: "مكتب الهجرة واللاجئين الاتحادي الألماني — المسؤول عن معالجة طلبات اللجوء في ألمانيا. بعد التسجيل الأولي، سيحدد BAMF موعد مقابلة لجوء رسمية (Anhörung). لديك الحق في مترجم ومحامٍ خلال هذه العملية.",
      fr: "Office fédéral allemand des migrations et des réfugiés — responsable du traitement des demandes d'asile en Allemagne. Après l'enregistrement initial, le BAMF programmera votre entretien d'asile formel (Anhörung). Vous avez le droit à un interprète et à un avocat pendant ce processus.",
      am: "Bundesamt für Migration und Flüchtlinge — ለጀርመን ጥገኝነት ማመልከቻዎችን ለማስተናገድ ኃላፊነት ያለው የጀርመን ፌዴራል ቢሮ። የመጀመሪያ ምዝገባ በኋላ፣ BAMF ይፋዊ ጥገኝነት ቃለ መጠይቅ (Anhörung) ይዘጋጃሉ። በዚህ ሂደት ወቅት አስተርጓሚ እና ጠበቃ የማግኘት መብት አለህ።",
    },
    context: "intake, protection",
    audience: "both",
  },
  {
    id: "bescheid",
    term: {
      en: "Bescheid — German Decision Letter",
      ar: "Bescheid — خطاب القرار الألماني",
      fr: "Bescheid — Lettre de Décision Allemande",
      am: "Bescheid — የጀርመን ውሳኔ ደብዳቤ",
    },
    definition: {
      en: "The official decision letter from BAMF on your asylum case. It tells you if you were granted refugee status, subsidiary protection, or if your claim was rejected. If rejected, you usually have 2 weeks to appeal — seek a lawyer immediately if you receive a negative Bescheid.",
      ar: "خطاب القرار الرسمي من BAMF بشأن قضية لجوءك. يخبرك ما إذا مُنحت وضع لاجئ، أو حماية فرعية، أو إذا رُفض طلبك. في حالة الرفض، عادةً لديك أسبوعان للطعن — اطلب محاميًا فورًا إذا تلقيت Bescheid سلبيًا.",
      fr: "La lettre de décision officielle du BAMF sur votre dossier d'asile. Elle vous dit si le statut de réfugié vous a été accordé, une protection subsidiaire, ou si votre demande a été rejetée. En cas de rejet, vous avez généralement 2 semaines pour faire appel — consultez immédiatement un avocat si vous recevez un Bescheid négatif.",
      am: "ስለ ጥገኝነት ጉዳይህ ከ BAMF የሚሰጥ ይፋዊ ውሳኔ ደብዳቤ። የስደተኛ ሁኔታ ተሰጥቶህ፣ ረዳት ጥበቃ ወይም ጥያቄህ ተቀባይነት አጥቶ ቢሆን ይነግርሃል። ተቀባይነት ካጣ፣ ብዙ ጊዜ ለመከፍከፍ 2 ሳምንት ጊዜ አለህ — አሉታዊ Bescheid ቢደርስህ ወዲያውኑ ጠበቃ ፈልግ።",
    },
    context: "protection",
    audience: "both",
  },
  {
    id: "anhörung",
    term: {
      en: "Anhörung — German Asylum Interview",
      ar: "Anhörung — مقابلة اللجوء الألمانية",
      fr: "Anhörung — Entretien d'Asile Allemand",
      am: "Anhörung — የጀርመን ጥገኝነት ቃለ መጠይቅ",
    },
    definition: {
      en: "The formal BAMF hearing where you explain your reasons for seeking asylum in detail. This is the most important step in the German asylum process. Prepare your personal story clearly. You have the right to an interpreter in your language. Bring all documents you have.",
      ar: "جلسة الاستماع الرسمية في BAMF حيث تشرح أسباب طلبك اللجوء بالتفصيل. هذه هي الخطوة الأهم في عملية اللجوء الألمانية. استعد لقصتك الشخصية بوضوح. لديك الحق في مترجم بلغتك. أحضر جميع الوثائق التي لديك.",
      fr: "L'audience formelle du BAMF où vous expliquez en détail vos raisons de demander l'asile. C'est l'étape la plus importante dans la procédure d'asile allemande. Préparez clairement votre histoire personnelle. Vous avez le droit à un interprète dans votre langue. Apportez tous les documents que vous avez.",
      am: "ጥገኝነት ለምን እንደ ፈለክ በዝርዝር የምታብራራበት ይፋዊ BAMF ሰሚ። ይህ በጀርመን ጥገኝነት ሂደት ውስጥ ትልቁ ደረጃ ነው። የግል ታሪክህን ግልጽ አድርጎ አዘጋጅ። በቋንቋህ አስተርጓሚ የማግኘት መብት አለህ። ያሉህን ሁሉ ሰነዶች አምጣ።",
    },
    context: "protection",
    audience: "both",
  },
  {
    id: "poc",
    term: {
      en: "POC — Person of Concern",
      ar: "الشخص المعني",
      fr: "POC — Personne Concernée",
      am: "POC — የሚያሳስብ ሰው",
    },
    definition: {
      en: "UNHCR's term for anyone under its protection mandate — refugees, asylum seekers, stateless persons, internally displaced persons (IDPs), and returnees. If you are a POC, UNHCR has a duty to help protect your rights.",
      ar: "مصطلح المفوضية لأي شخص يخضع لولايتها الحمائية — اللاجئون وطالبو اللجوء وعديمو الجنسية والمشردون داخليًا والعائدون. إذا كنت شخصًا معنيًا، فعلى المفوضية واجب المساعدة في حماية حقوقك.",
      fr: "Le terme du HCR pour toute personne relevant de son mandat de protection — réfugiés, demandeurs d'asile, apatrides, personnes déplacées internes (PDI) et rapatriés. Si vous êtes une POC, le HCR a le devoir d'aider à protéger vos droits.",
      am: "ስደተኞችን፣ ጥገኝነት ጠያቂዎችን፣ ዜግነት ለሌላቸው፣ ውስጣዊ ፈናቃዮች (IDPs) እና ተመላሾችን ጨምሮ በጥበቃ ስልጣን ስር ያለ ማንኛውም ሰው ለ UNHCR ቃሉ። POC ከሆንክ፣ UNHCR መብቶቼን ለመጠበቅ ሊረዳ ግዴታ አለበት።",
    },
    context: "protection",
    audience: "caseworker",
  },
  {
    id: "multimodal_synthesis",
    term: {
      en: "Dossier Reconstruction",
      ar: "إعادة بناء الملف",
      fr: "Reconstruction du Dossier",
      am: "ፋይል ዳግም ግንባታ",
    },
    definition: {
      en: "When documents are partial or damaged, Gemma 4 Analyst reads all fragments together — passport photo, audio testimony, handwritten notes — and builds one unified record. Every field shows which document it came from so the caseworker can verify. Gemma 4's multimodal capability (text + image + audio) makes this possible offline on a Pi 5.",
      ar: "عندما تكون الوثائق جزئية أو تالفة، يقرأ Gemma 4 Analyst جميع الأجزاء معًا — صورة جواز السفر والشهادة الصوتية والملاحظات المكتوبة بخط اليد — ويبني سجلاً موحدًا. يُظهر كل حقل الوثيقة التي جاء منها حتى يتمكن الموظف من التحقق. تجعل قدرة Gemma 4 متعددة الوسائط (نص + صورة + صوت) هذا ممكنًا في وضع عدم الاتصال على Pi 5.",
      fr: "Quand les documents sont partiels ou endommagés, Gemma 4 Analyst lit tous les fragments ensemble — photo de passeport, témoignage audio, notes manuscrites — et construit un dossier unifié. Chaque champ montre de quel document il provient afin que l'agent puisse vérifier. La capacité multimodale de Gemma 4 (texte + image + audio) rend cela possible hors ligne sur un Pi 5.",
      am: "ሰነዶቹ ከፊል ወይም የተበሳሹ ሲሆኑ፣ Gemma 4 Analyst ሁሉም ቁርጥራጮቻቸው አብረው ያነብባቸዋል — ፓስፖርት ፎቶ፣ ኦዲዮ ምስክርነት፣ በእጅ የጻፉ ማስታወሻዎች — እና አንድ አንድ ሰብሳቢ መዝገብ ይገነባል። እያንዳንዱ ሜዳ ከየትኛው ሰነድ እንደ መጣ ሠራተኛው ሊያረጋግጥ ስለሚችል ያሳያል። የ Gemma 4 ባለ ብዙ-ሚዲያ ችሎታ (ጽሑፍ + ምስል + ኦዲዮ) በ Pi 5 ላይ ሳይኖር ኢንተርኔት ይህን ያደርጋዋል።",
    },
    context: "intake, auditor",
    audience: "caseworker",
  },
  {
    id: "purpose_limitation",
    term: {
      en: "Purpose Limitation",
      ar: "تقييد الغرض",
      fr: "Limitation de Finalité",
      am: "ዓላማ ገደብ",
    },
    definition: {
      en: "Data collected for emergency registration cannot be used for something else without your permission. For example, your intake information cannot be shared with police, immigration enforcement, or your country of origin's government without your consent.",
      ar: "البيانات المجمعة للتسجيل الطارئ لا يمكن استخدامها لأي غرض آخر دون إذنك. على سبيل المثال، لا يمكن مشاركة معلومات استقبالك مع الشرطة أو جهات تنفيذ الهجرة أو حكومة بلدك الأصلي دون موافقتك.",
      fr: "Les données collectées pour l'enregistrement d'urgence ne peuvent pas être utilisées à d'autres fins sans votre permission. Par exemple, vos informations d'accueil ne peuvent pas être partagées avec la police, les services d'immigration ou le gouvernement de votre pays d'origine sans votre consentement.",
      am: "ለድንገተኛ ምዝገባ የተሰበሰበ ውሂብ ያለ ፈቃድህ ለሌላ ነገር ሊያገለግሉ አይችልም። ለምሳሌ፣ ቅበላ መረጃህ ያለ ፈቃድህ ፖሊስ፣ የኢሚግሬሽን ባለስልጣናት ወይም ትውልድ አገርህ መንግስት ሊጋራ አይችልም።",
    },
    legal_reference: "UNHCR Data Protection Policy",
    context: "auditor, protection",
    audience: "both",
  },
];

// Helper: search across all 4 languages
export function searchGlossary(
  query: string,
  lang: "en" | "ar" | "fr" | "am" = "en"
): GlossaryTerm[] {
  const q = query.toLowerCase();
  return GLOSSARY_TERMS.filter((t) => {
    const termText = (t.term[lang] ?? t.term.en).toLowerCase();
    const defText  = (t.definition[lang] ?? t.definition.en).toLowerCase();
    return termText.includes(q) || defText.includes(q);
  });
}

export function getGlossaryTermTranslation(
  termId: string,
  _language: "en" | "ar" | "fr" | "am" = "en"
): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.id === termId);
}

export function getTermsByContext(
  context: string,
  _language: "en" | "ar" | "fr" | "am" = "en"
): GlossaryTerm[] {
  return GLOSSARY_TERMS.filter((t) =>
    t.context?.split(",").map((c) => c.trim()).includes(context)
  );
}

export function getTermsByAudience(
  audience: "caseworker" | "refugee" | "both"
): GlossaryTerm[] {
  return GLOSSARY_TERMS.filter(
    (t) => !t.audience || t.audience === audience || t.audience === "both"
  );
}

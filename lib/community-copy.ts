// كل كلمات «مملكة القراء» في مكان واحد — عدّل أي كلمة هنا فتتغير بكل الصفحات.
// الترجمة مبنية على مرجع Qidian (书友圈) مع مراعاة الأثر النفسي على القارئ:
// الانتماء («عضو»)، التقدير («مميّز»، «مختارات»)، والدعوة اللطيفة للمشاركة («شارك»).

export const COPY = {
  kingdom: "مملكة القراء",
  kingdomOf: (title: string) => `مملكة قرّاء ${title}`,
  globalTitle: "مجتمع القرّاء",

  // الهيدر
  checkIn: "حضور",
  checkedIn: "حاضر ✓",
  level: (n: number) => `مستوى ${n}`,
  members: (n: string) => `${n} عضو`,
  posts: (n: string) => `${n} منشور`,

  // التبويبات
  tabs: { feed: "المنشورات", featured: "المختارات", fanwork: "إبداعات القراء" },

  // التصنيفات (شرائح الفلتر) — الترتيب كما بالمرجع
  kinds: {
    all: "الكل",
    discussion: "نقاشات",
    review: "مراجعات",
    merch: "مقتنيات",
    share: "مشاركات",
    fanwork: "إبداعات",
    other: "أخرى",
  },

  // الفرز
  sorts: { activity: "آخر نشاط", newest: "الأحدث", likes: "الأكثر إعجابًا" },

  // الشارات
  pinned: "مثبّت",
  featured: "مميّز",
  ranks: ["مبتدئ", "متدرّب", "حارس", "فارس", "حكيم", "أمير"],

  // أزرار وحالات
  publish: "شارك",
  loadMore: "عرض المزيد",
  loading: "جارٍ التحميل…",
  noMore: "وصلت إلى آخر المنشورات",
  emptyTitle: "لا أحد هنا بعد",
  emptyBody: "كن أول من يترك أثرًا في هذه المملكة.",
  offline: "تعذّر الاتصال بالمملكة الآن، حاول بعد قليل.",

  // الكتابة
  composeTitle: "منشور جديد",
  composeKind: "التصنيف",
  composeTitlePh: "عنوان (اختياري)",
  composeBodyPh: "ماذا شعرت وأنت تقرأ؟ شاركه مع بقية القرّاء…",
  composeSend: "نشر",
  composeSending: "جارٍ النشر…",
  composeTooShort: "اكتب كلمتين على الأقل.",
  composeLimit: "وصلت للحد المؤقت للنشر، جرّب بعد قليل.",

  // الهوية
  nameTitle: "ما اسمك في المملكة؟",
  nameHint: "سيظهر هذا الاسم بجانب مشاركاتك.",
  namePh: "اسمك (2–24 حرفًا)",
  nameSave: "ابدأ",

  // المنشور والتعليقات
  postTitle: "المنشور",
  comments: "التعليقات",
  commentPh: "اكتب ردّك…",
  commentSend: "إرسال",
  noComments: "لا توجد تعليقات بعد — ابدأ الحديث.",
  deleteOwn: "حذف",
  deleteConfirm: "حذف هذا المنشور نهائيًا؟",
  deleteCommentConfirm: "حذف هذا التعليق؟",
  inNovel: "في",
  backToKingdom: "مملكة الرواية",

  // قسم مملكة القراء بصفحة الرواية
  viewAll: (n: number) => `عرض كل المنشورات (${n} نقاش)`,

  // الشرح بسهم التوسيع بالهيدر
  intro: (title: string) =>
    `مرحبًا بك في مملكة قرّاء «${title}». هنا نتشارك الانطباعات والنظريات والمراجعات بلطف واحترام. تنبيه: ضع تحذير «حرق» قبل أي كشف لأحداث الرواية.`,
  introGlobal:
    "هنا يلتقي قرّاء كل الروايات: آخر ما كُتب في الممالك، من كل مكان.",
} as const;

export type PostKind = "discussion" | "review" | "merch" | "share" | "fanwork" | "other";
export const POST_KINDS: PostKind[] = [
  "discussion",
  "review",
  "merch",
  "share",
  "fanwork",
  "other",
];

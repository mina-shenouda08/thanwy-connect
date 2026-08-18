export const GRADES = [
  { value: "first", label: "أولى ثانوي" },
  { value: "second", label: "ثانية ثانوي" },
  { value: "third", label: "ثالثة ثانوي" },
] as const;

export const gradeLabel = (v?: string | null) => GRADES.find((g) => g.value === v)?.label ?? "—";

export const EVENT_TYPES = [
  { value: "sunday_school", label: "مدارس أحد" },
  { value: "activity", label: "نشاط" },
  { value: "recreation", label: "رحلة" },
  { value: "liturgy", label: "قداس" },
  { value: "tasbeha", label: "تسبحة" },
] as const;

export const eventTypeLabel = (v: string) =>
  EVENT_TYPES.find((t) => t.value === v)?.label ?? "أساسي";

export const PRAYER_COUNTERS = [
  { key: "morning", label: "باكر" },
  { key: "sunset", label: "غروب" },
  { key: "sleep", label: "نوم" },
  { key: "spontaneous", label: "ارتجالي" },
] as const;

export const SACRAMENTS = [
  { key: "communion", label: "تناول" },
  { key: "confession", label: "آخر اعتراف" },
] as const;

export const OLD_TESTAMENT = [
  "التكوين",
  "الخروج",
  "اللاويين",
  "العدد",
  "التثنية",
  "يشوع",
  "القضاة",
  "راعوث",
  "صموئيل الأول",
  "صموئيل الثاني",
  "الملوك الأول",
  "الملوك الثاني",
  "أخبار الأيام الأول",
  "أخبار الأيام الثاني",
  "عزرا",
  "نحميا",
  "أستير",
  "أيوب",
  "المزامير",
  "الأمثال",
  "الجامعة",
  "نشيد الأناشيد",
  "إشعياء",
  "إرميا",
  "مراثي إرميا",
  "حزقيال",
  "دانيال",
  "هوشع",
  "يوئيل",
  "عاموس",
  "عوبديا",
  "يونان",
  "ميخا",
  "ناحوم",
  "حبقوق",
  "صفنيا",
  "حجي",
  "زكريا",
  "ملاخي",
];

export const NEW_TESTAMENT = [
  "إنجيل متى",
  "إنجيل مرقس",
  "إنجيل لوقا",
  "إنجيل يوحنا",
  "أعمال الرسل",
  "رومية",
  "كورنثوس الأولى",
  "كورنثوس الثانية",
  "غلاطية",
  "أفسس",
  "فيلبي",
  "كولوسي",
  "تسالونيكي الأولى",
  "تسالونيكي الثانية",
  "تيموثاوس الأولى",
  "تيموثاوس الثانية",
  "تيطس",
  "فليمون",
  "العبرانيين",
  "يعقوب",
  "بطرس الأولى",
  "بطرس الثانية",
  "يوحنا الأولى",
  "يوحنا الثانية",
  "يوحنا الثالثة",
  "يهوذا",
  "الرؤيا",
];

export const booksFor = (testament: string) =>
  testament === "old" ? OLD_TESTAMENT : testament === "new" ? NEW_TESTAMENT : [];

export const testamentLabel = (t?: string | null) =>
  t === "old" ? "عهد قديم" : t === "new" ? "عهد جديد" : "";

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const formatTime = (t?: string | null) => (t ? t.slice(0, 5) : "");

export const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86400000);

export const FOLLOWUP_CHIPS = ["محتاج افتقاد", "مريض", "عنده امتحانات"];

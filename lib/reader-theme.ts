export type ReaderTheme = "original" | "quiet" | "paper" | "bold" | "calm" | "focus";

export const READER_PALETTES: Record<
  ReaderTheme,
  {
    label: string;
    swatch: string;
    pageBg: string;
    text: string;
    mutedText: string;
    cardBorder: string;
    divider: string;
    chipBg: string;
    chipText: string;
    chipActiveBg: string;
    chipActiveText: string;
    /** ثيم "غامق" — يخلي وزن نص الفصل bold زي آبل بوكس */
    boldText?: boolean;
    /** خط الثيم داخل شبكة الثيمات (Aa) — بعضها serif زي المرجع */
    swatchFontFamily?: string;
  }
> = {
  original: {
    label: "أصلي",
    swatch: "#ffffff",
    pageBg: "#ffffff",
    text: "#1a1a1a",
    mutedText: "#8a8a8a",
    cardBorder: "rgba(25,25,25,0.14)",
    divider: "rgba(25,25,25,0.10)",
    chipBg: "#eeeeec",
    chipText: "#333333",
    chipActiveBg: "#fdeceb",
    chipActiveText: "#e5353e",
  },
  quiet: {
    label: "هادئ",
    swatch: "#3a3a3c",
    pageBg: "#242426",
    text: "#e8e8ea",
    mutedText: "#9a9a9e",
    cardBorder: "rgba(255,255,255,0.14)",
    divider: "rgba(255,255,255,0.10)",
    chipBg: "#323234",
    chipText: "#d4d4d8",
    chipActiveBg: "#3a2426",
    chipActiveText: "#f0565e",
  },
  paper: {
    label: "ورقي",
    swatch: "#efefee",
    pageBg: "#f2f1ec",
    text: "#2a2a2a",
    mutedText: "#8a8a80",
    cardBorder: "rgba(25,25,20,0.14)",
    divider: "rgba(25,25,20,0.10)",
    chipBg: "#e6e5dd",
    chipText: "#333333",
    chipActiveBg: "#e3d8c0",
    chipActiveText: "#a34a2f",
  },
  bold: {
    label: "غامق",
    swatch: "#ffffff",
    pageBg: "#ffffff",
    text: "#000000",
    mutedText: "#7a7a7a",
    cardBorder: "rgba(0,0,0,0.18)",
    divider: "rgba(0,0,0,0.12)",
    chipBg: "#eeeeec",
    chipText: "#111111",
    chipActiveBg: "#fdeceb",
    chipActiveText: "#e5353e",
    boldText: true,
  },
  calm: {
    label: "دافئ",
    swatch: "#f0dcae",
    pageBg: "#f4ecd8",
    text: "#433422",
    mutedText: "#8a7a63",
    cardBorder: "rgba(67,52,34,0.20)",
    divider: "rgba(67,52,34,0.14)",
    chipBg: "#ece0c8",
    chipText: "#433422",
    chipActiveBg: "#e3d2ab",
    chipActiveText: "#a34a2f",
    swatchFontFamily: "'Noto Naskh Arabic', serif",
  },
  focus: {
    label: "تركيز",
    swatch: "#fdf7ea",
    pageBg: "#fdf8ec",
    text: "#2a2a2a",
    mutedText: "#9a9280",
    cardBorder: "rgba(25,20,10,0.14)",
    divider: "rgba(25,20,10,0.10)",
    chipBg: "#f2ead2",
    chipText: "#433422",
    chipActiveBg: "#e9dcb8",
    chipActiveText: "#a34a2f",
  },
};

export const READER_FONTS = [
  { id: "sans", label: "بدون تشكيل", family: "var(--font-sans)" },
  { id: "tajawal", label: "طجوال", family: "'Tajawal', var(--font-sans)" },
  { id: "naskh", label: "نسخ", family: "'Noto Naskh Arabic', serif" },
  { id: "amiri", label: "أميري", family: "'Amiri', serif" },
] as const;

export type ReaderFontId = (typeof READER_FONTS)[number]["id"];

export const READER_WIDTHS = [
  { id: "auto", label: "تلقائي", px: null },
  { id: "560", label: "560", px: 560 },
  { id: "680", label: "680", px: 680 },
  { id: "800", label: "800", px: 800 },
] as const;

export type ReaderWidthId = (typeof READER_WIDTHS)[number]["id"];

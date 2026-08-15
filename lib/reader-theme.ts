export type ReaderTheme = "light" | "night" | "sepia" | "green";

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
  }
> = {
  light: {
    label: "أبيض",
    swatch: "#ffffff",
    pageBg: "#f5f5f5",
    text: "#191919",
    mutedText: "#8a8a8a",
    cardBorder: "rgba(25,25,25,0.14)",
    divider: "rgba(25,25,25,0.10)",
    chipBg: "#eeeeec",
    chipText: "#333333",
    chipActiveBg: "#fdeceb",
    chipActiveText: "#e5353e",
  },
  night: {
    label: "ليلي",
    swatch: "#3a3a3d",
    pageBg: "#18181b",
    text: "#e4e4e7",
    mutedText: "#8f8f96",
    cardBorder: "rgba(255,255,255,0.14)",
    divider: "rgba(255,255,255,0.10)",
    chipBg: "#28282c",
    chipText: "#d4d4d8",
    chipActiveBg: "#3a2426",
    chipActiveText: "#f0565e",
  },
  sepia: {
    label: "دافئ",
    swatch: "#f0e2c0",
    pageBg: "#f4ecd8",
    text: "#433422",
    mutedText: "#8a7a63",
    cardBorder: "rgba(67,52,34,0.20)",
    divider: "rgba(67,52,34,0.14)",
    chipBg: "#ece0c8",
    chipText: "#433422",
    chipActiveBg: "#e3d2ab",
    chipActiveText: "#a34a2f",
  },
  green: {
    label: "أخضر مريح",
    swatch: "#c7ddc5",
    pageBg: "#e8f1e6",
    text: "#28331f",
    mutedText: "#728068",
    cardBorder: "rgba(40,51,31,0.18)",
    divider: "rgba(40,51,31,0.12)",
    chipBg: "#d7e7d3",
    chipText: "#28331f",
    chipActiveBg: "#c2dabd",
    chipActiveText: "#3c6b2c",
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

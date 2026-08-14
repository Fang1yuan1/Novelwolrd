export type ReaderTheme = "light" | "night" | "sepia";

export const READER_PALETTES: Record<
  ReaderTheme,
  {
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
};

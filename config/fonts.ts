// Use IRAN Sans X variable font
export const fontSans = {
  variable: "--font-sans",
  style: {
    fontFamily: "'IRAN Sans X', sans-serif",
    fontFeatureSettings: "'locl' 1, 'ss02' 1",
    fontVariantNumeric: "proportional-nums",
    fontLanguageOverride: "FAR",
  },
};

// Use a system font fallback instead of Fira Code to avoid Turbopack issues
export const fontMono = {
  variable: "--font-mono",
  style: {
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontFeatureSettings: "'locl' 1",
  },
};

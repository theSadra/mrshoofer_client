// Use Vazir font instead of Vazirmatn
export const fontSans = {
  variable: "--font-sans",
  style: {
    fontFamily: "'Vazir', sans-serif",
  },
};

// Use a system font fallback instead of Fira Code to avoid Turbopack issues
export const fontMono = {
  variable: "--font-mono",
  style: {
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
  },
};

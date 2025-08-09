import { Vazirmatn as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Use a system font fallback instead of Fira Code to avoid Turbopack issues
export const fontMono = {
  variable: "--font-mono",
  style: {
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace"
  }
};

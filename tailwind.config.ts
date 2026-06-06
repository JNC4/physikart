import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-edge": "var(--paper-edge)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-faint": "var(--ink-faint)",
        plate: "var(--plate)",
        mark: "var(--mark)",
        "mark-soft": "var(--mark-soft)",
      },
      fontFamily: {
        prose: ["var(--font-spectral)", "Georgia", "serif"],
        label: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        sheet: "var(--sheet-max)",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        // "Public Sans" (from the design) with a system fallback so it renders
        // instantly and never blocks the build.
        sans: [
          "Public Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // Editorial serif for marketing headings (landing, legal). App UI stays sans.
        // Young Serif ships one weight only: build hierarchy with size, never bold it.
        // (Fraunces, then Newsreader, were retired; see docs/15.)
        display: ["Young Serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        // "Switchboard" mono voice: micro-labels, timestamps, log-style captions.
        // Fragment Mono ships regular weight only; never bold it.
        mono: ["Fragment Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Muted steel-blue. Trustworthy, clinical, deliberately not neon.
        brand: {
          50: "#f0f4f8",
          100: "#dbe4ee",
          200: "#bccfe0",
          300: "#94afc9",
          400: "#6b8caf",
          500: "#4a6d93",
          600: "#3b5778",
          700: "#2f4560",
          800: "#283a50",
          900: "#1f2d3d",
        },
      },
      boxShadow: {
        // Soft, low-contrast elevation, no glow.
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

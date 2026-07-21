import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Token system — Noir Royale
        void: "#08080A", // deepest background
        graphite: {
          DEFAULT: "#17171B",
          light: "#232328",
          border: "#2E2E35",
        },
        gold: {
          DEFAULT: "#D4AF37",
          bright: "#F4D06F",
          dim: "#8A722A",
        },
        garnet: {
          DEFAULT: "#9E1B32", // felt red, muted vs neon
          bright: "#C41E3A",
        },
        felt: "#0F1410",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 24px rgba(212,175,55,0.35), 0 0 2px rgba(212,175,55,0.6)",
        "garnet-glow": "0 0 20px rgba(196,30,58,0.45)",
        premium: "0 20px 60px -15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "radial-vignette": "radial-gradient(ellipse at center, rgba(23,23,27,0.4) 0%, rgba(8,8,10,0.95) 75%)",
        "gold-sheen": "linear-gradient(120deg, #8A722A 0%, #F4D06F 45%, #D4AF37 55%, #8A722A 100%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "float-up": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 3.5s linear infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "float-up": "float-up 1.1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;

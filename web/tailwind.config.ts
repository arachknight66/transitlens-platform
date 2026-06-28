import type { Config } from "tailwindcss";
import { ds } from "./lib/design-tokens";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-void": ds.bg.void,
        "bg-base": ds.bg.base,
        "bg-surface": ds.bg.surface,
        "bg-elevated": ds.bg.elevated,
        "bg-overlay": ds.bg.overlay,
        "bg-dark": ds.bg.base,
        "bg-card": ds.bg.elevated,

        brand: ds.brand.mid,
        "brand-deep": ds.brand.deep,
        "brand-core": ds.brand.core,
        "brand-light": ds.brand.light,
        "brand-ghost": ds.brand.ghost,
        primary: ds.brand.mid,

        "cls-planet-bg": ds.cls.planet.bg,
        "cls-planet-border": ds.cls.planet.border,
        "cls-planet-text": ds.cls.planet.text,
        "cls-binary-bg": ds.cls.binary.bg,
        "cls-binary-border": ds.cls.binary.border,
        "cls-binary-text": ds.cls.binary.text,
        "cls-blend-bg": ds.cls.blend.bg,
        "cls-blend-border": ds.cls.blend.border,
        "cls-blend-text": ds.cls.blend.text,
        "cls-noise-bg": ds.cls.noise.bg,
        "cls-noise-border": ds.cls.noise.border,
        "cls-noise-text": ds.cls.noise.text,

        planet: ds.cls.planet.badge,
        binary: ds.cls.binary.badge,
        blend: ds.cls.blend.badge,
        noise: ds.cls.noise.badge,

        "status-ok": ds.status.ok,
        "status-warn": ds.status.warn,
        "status-error": ds.status.error,
        "status-info": ds.status.info,
        "status-green": ds.status.ok,
        "status-amber": ds.status.warn,
        "status-red": ds.status.error,

        "text-primary": ds.text.primary,
        "text-secondary": ds.text.secondary,
        "text-muted": ds.text.muted,

        "border-subtle": ds.border.subtle,
        "border-soft": ds.border.soft,
        "border-strong": ds.border.strong,
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4" }],
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["12px", { lineHeight: "1.5" }],
        base: ["13px", { lineHeight: "1.6" }],
        md: ["14px", { lineHeight: "1.6" }],
        lg: ["16px", { lineHeight: "1.5" }],
        xl: ["20px", { lineHeight: "1.4" }],
        "2xl": ["24px", { lineHeight: "1.3" }],
        "3xl": ["32px", { lineHeight: "1.2" }],
        caption: ["11px", { lineHeight: "1.4" }],
        body: ["13px", { lineHeight: "1.6" }],
        ui: ["14px", { lineHeight: "1.6" }],
        heading: ["16px", { lineHeight: "1.5" }],
        "heading-xl": ["20px", { lineHeight: "1.4" }],
        display: ["32px", { lineHeight: "1.2" }],
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "glow-brand": `0 0 24px ${ds.brand.glow}`,
        "glow-ok": "0 0 16px rgba(76,175,80,0.3)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.5)",
      },
      transitionDuration: {
        fast: "150ms",
      },
      transitionTimingFunction: {
        snap: ds.easing.snap,
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        fadeInUp: "fadeInUp 0.6s ease-out",
        barGrow: "barGrow 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        barGrow: {
          "0%": { width: "0%" },
          "100%": { width: "var(--bar-w, 100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

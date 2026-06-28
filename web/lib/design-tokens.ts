export const ds = {
  bg: {
    void: "#08090D",
    base: "#0E1117",
    surface: "#13141C",
    elevated: "#1A1B27",
    overlay: "#21222E",
  },

  brand: {
    deep: "#2B2478",
    core: "#3E37A8",
    mid: "#534AB7",
    light: "#7B74D4",
    ghost: "rgba(83,74,183,0.12)",
    glow: "rgba(83,74,183,0.35)",
  },

  cls: {
    planet: { bg: "#1E1B45", border: "#3C3489", text: "#8A80F5", badge: "#3C3489" },
    binary: { bg: "#2D1710", border: "#712B13", text: "#E07060", badge: "#712B13" },
    blend: { bg: "#2A2000", border: "#9A6500", text: "#D4A020", badge: "#D48B00" },
    noise: { bg: "#1A1A1A", border: "#555553", text: "#999997", badge: "#444441" },
  },

  status: {
    ok: "#4CAF50",
    warn: "#D48B00",
    error: "#EF5350",
    info: "#42A5F5",
  },

  text: {
    primary: "#FAFAFA",
    secondary: "#AAAAAA",
    muted: "#888888",
  },

  font: {
    size: {
      "2xs": 10,
      xs: 11,
      sm: 12,
      base: 13,
      md: 14,
      lg: 16,
      xl: 20,
      "2xl": 24,
      "3xl": 32,
    },
    weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    family: {
      sans: '"Inter",-apple-system,sans-serif',
      mono: '"JetBrains Mono","Fira Code",monospace',
    },
    leading: { tight: 1.2, snug: 1.4, normal: 1.6, relaxed: 1.8 },
  },

  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80 },

  easing: {
    snap: "cubic-bezier(0.25,0.46,0.45,0.94)",
    spring: [0.175, 0.885, 0.32, 1.275] as const,
    linear: "linear",
  },
  duration: { instant: 80, fast: 150, base: 220, slow: 350, xslow: 500 },

  radius: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  border: {
    subtle: "rgba(255,255,255,0.06)",
    soft: "rgba(255,255,255,0.10)",
    strong: "rgba(255,255,255,0.18)",
  },
} as const;

export function statusColor(value: number | null, lo: number, hi: number): string {
  if (value === null) return ds.text.muted;
  if (value >= hi) return ds.status.ok;
  if (value >= lo) return ds.status.warn;
  return ds.status.error;
}

import { ds, statusColor as dsStatusColor } from "./design-tokens";

/** @deprecated Import from `@/lib/design-tokens` instead. */
export const tokens = {
  colors: {
    planet: ds.cls.planet.badge,
    binary: ds.cls.binary.badge,
    blend: ds.cls.blend.badge,
    noise: ds.cls.noise.badge,
    primary: ds.brand.mid,
    bgDark: ds.bg.base,
    bgCard: ds.bg.elevated,
    textPrimary: ds.text.primary,
    textSecondary: ds.text.secondary,
    textMuted: ds.text.muted,
  },
  status: {
    green: ds.status.ok,
    amber: ds.status.warn,
    red: ds.status.error,
    ok: ds.status.ok,
    warn: ds.status.warn,
    error: ds.status.error,
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    pill: "999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "40px",
    xxl: "64px",
  },
  fonts: {
    caption: "11px",
    body: "13px",
    ui: "14px",
    heading: "16px",
    headingXl: "20px",
    display: "32px",
  },
} as const;

export { ds };
export const statusColor = dsStatusColor;

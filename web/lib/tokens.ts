export const tokens = {
  colors: {
    planet: "#3C3489",
    binary: "#712B13",
    blend: "#D48B00",
    noise: "#444441",
    primary: "#534AB7",
    bgDark: "#0E1117",
    bgCard: "#1A1A2E",
    textPrimary: "#FAFAFA",
    textSecondary: "#AAAAAA",
    textMuted: "#888888",
  },
  status: {
    green: "#4CAF50",
    amber: "#D48B00",
    red: "#FF6B6B",
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

export function statusColor(value: number | null, lo: number, hi: number): string {
  if (value === null) return "#888888";
  if (value >= hi) return tokens.status.green;
  if (value >= lo) return tokens.status.amber;
  return tokens.status.red;
}

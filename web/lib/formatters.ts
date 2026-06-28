export function formatPeriod(days: number | null | undefined): string {
  if (days == null) return "—";
  if (days < 1) return `${(days * 24).toFixed(2)} h`;
  return `${days.toFixed(4)} d`;
}

export function formatDepth(depth: number | null | undefined): string {
  if (depth == null) return "—";
  return `${(depth * 100).toFixed(3)}%`;
}

export function formatDuration(duration: number | null | undefined): string {
  if (duration == null) return "—";
  return `${(duration * 24).toFixed(2)} h`;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

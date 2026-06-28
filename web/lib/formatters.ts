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

export function formatUncertainty(
  errUpper?: number | null,
  errLower?: number | null,
  errSym?: number | null
): string | null {
  if (errUpper != null && errLower != null) {
    return `+${formatErr(errUpper)} / −${formatErr(errLower)}`;
  }
  if (errSym != null) {
    return `±${formatErr(errSym)}`;
  }
  return null;
}

function formatErr(v: number): string {
  if (v === 0) return "0";
  if (Math.abs(v) >= 1) return v.toFixed(2);
  if (Math.abs(v) >= 0.01) return v.toFixed(4);
  return v.toExponential(1);
}

export interface PhasePoint {
  x: number;
  y: number;
}

/** Downsample array to at most maxPoints elements. */
export function downsample<T>(arr: T[], maxPoints = 2000): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.max(1, Math.floor(arr.length / maxPoints));
  return arr.filter((_, i) => i % step === 0);
}

/**
 * Phase-fold time/flux arrays into -0.5..0.5 range.
 * Matches the interactive Streamlit / Phase 2 folding logic.
 */
export function phaseFold(
  time: number[],
  flux: number[],
  period: number,
  t0 = 0
): PhasePoint[] {
  const n = Math.min(time.length, flux.length);
  const points: PhasePoint[] = [];

  for (let i = 0; i < n; i++) {
    let phase = ((time[i] - t0) % period) / period;
    if (phase > 0.5) phase -= 1;
    if (phase < -0.5) phase += 1;
    points.push({ x: phase, y: flux[i] });
  }

  return points;
}

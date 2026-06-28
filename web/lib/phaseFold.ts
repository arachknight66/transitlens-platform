export interface PhasePoint {
  x: number;
  y: number;
}

export interface BinPoint {
  x: number;
  y: number;
  yStd: number;
  n: number;
}

/** Downsample array to at most maxPoints elements. */
export function downsample<T>(arr: T[], maxPoints = 2000): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.max(1, Math.floor(arr.length / maxPoints));
  return arr.filter((_, i) => i % step === 0);
}

/**
 * Phase-fold time/flux arrays into -0.5..0.5 range.
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

/** Compute binned averages with ±1σ for phase-fold overlay. */
export function computeBinnedAverage(
  points: PhasePoint[],
  numBins = 50,
  xMin = -0.5,
  xMax = 0.5
): BinPoint[] {
  const binWidth = (xMax - xMin) / numBins;
  const bins: { sum: number; sumSq: number; n: number }[] = Array.from(
    { length: numBins },
    () => ({ sum: 0, sumSq: 0, n: 0 })
  );

  for (const p of points) {
    if (p.x < xMin || p.x >= xMax) continue;
    const idx = Math.min(numBins - 1, Math.floor((p.x - xMin) / binWidth));
    bins[idx].sum += p.y;
    bins[idx].sumSq += p.y * p.y;
    bins[idx].n += 1;
  }

  return bins.map((b, i) => {
    const x = xMin + (i + 0.5) * binWidth;
    if (b.n === 0) return { x, y: 1, yStd: 0, n: 0 };
    const mean = b.sum / b.n;
    const variance = Math.max(0, b.sumSq / b.n - mean * mean);
    return { x, y: mean, yStd: Math.sqrt(variance), n: b.n };
  });
}

/** Simple trapezoidal transit model centered at phase 0. */
export function trapezoidalTransit(
  phase: number,
  depth: number,
  durationPhase: number,
  baseline = 1
): number {
  const half = durationPhase / 2;
  const ingress = half * 0.2;
  const absPhase = Math.abs(phase);

  if (absPhase >= half) return baseline;
  if (absPhase <= half - ingress) return baseline - depth;

  const t = (absPhase - (half - ingress)) / ingress;
  return baseline - depth * (1 - t);
}

/** Generate synthetic BLS periodogram around detected period for interactive chart. */
export function syntheticPeriodogram(
  detectedPeriod: number,
  numPoints = 200
): { period: number; power: number }[] {
  const minP = detectedPeriod * 0.3;
  const maxP = detectedPeriod * 3;
  const points: { period: number; power: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const period = minP + ((maxP - minP) * i) / (numPoints - 1);
    const ratio = period / detectedPeriod;
    const peak =
      Math.exp(-Math.pow(ratio - 1, 2) / 0.02) +
      0.3 * Math.exp(-Math.pow(ratio - 0.5, 2) / 0.01) +
      0.25 * Math.exp(-Math.pow(ratio - 2, 2) / 0.015);
    const noise = 0.05 + 0.03 * Math.sin(i * 0.7);
    points.push({ period, power: peak + noise });
  }

  return points;
}

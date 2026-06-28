export interface ParsedLightCurve {
  time: number[];
  flux: number[];
  filename: string;
}

export class LightCurveParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LightCurveParseError";
  }
}

function findColumnIndex(headers: string[], names: string[]): number {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const name of names) {
    const idx = lower.indexOf(name.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
}

export function parseCsvLightCurve(text: string, filename: string): ParsedLightCurve {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new LightCurveParseError("CSV must contain a header row and at least one data row.");
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const timeIdx = findColumnIndex(headers, ["time", "t", "bjd", "btjd"]);
  const fluxIdx = findColumnIndex(headers, ["flux", "f", "flux_norm", "normalized_flux"]);

  if (timeIdx < 0 || fluxIdx < 0) {
    throw new LightCurveParseError("CSV must include 'time' and 'flux' columns.");
  }

  const time: number[] = [];
  const flux: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length <= Math.max(timeIdx, fluxIdx)) continue;
    const t = parseFloat(cols[timeIdx].trim());
    const f = parseFloat(cols[fluxIdx].trim());
    if (Number.isFinite(t) && Number.isFinite(f)) {
      time.push(t);
      flux.push(f);
    }
  }

  if (time.length < 500) {
    throw new LightCurveParseError(`Need at least 500 data points (found ${time.length}).`);
  }

  const fluxMin = Math.min(...flux);
  const fluxMax = Math.max(...flux);
  if (fluxMin < 0.5 || fluxMax > 1.5) {
    throw new LightCurveParseError(
      "Flux values should be normalized near 1.0 (expected range ~0.5–1.5)."
    );
  }

  return { time, flux, filename };
}

export async function loadDemoCandidateCsv(
  candidateId: "a" | "b" | "c"
): Promise<ParsedLightCurve> {
  const res = await fetch(`/demo_data/candidate_${candidateId}.csv`);
  if (!res.ok) {
    throw new LightCurveParseError(`Could not load candidate_${candidateId}.csv`);
  }
  const text = await res.text();
  return parseCsvLightCurve(text, `candidate_${candidateId}.csv`);
}

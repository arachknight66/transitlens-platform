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

function getMedian(arr: number[]): number {
  if (arr.length === 0) return 1;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getColumnFormatSize(tform: string): { size: number; type: string; repeat: number } {
  const match = tform.trim().match(/^(\d*)([A-Z])$/i);
  if (!match) {
    return { size: 0, type: "", repeat: 0 };
  }
  const repeat = match[1] ? parseInt(match[1], 10) : 1;
  const type = match[2].toUpperCase();
  let typeSize = 0;

  switch (type) {
    case "D":
      typeSize = 8;
      break;
    case "E":
    case "J":
      typeSize = 4;
      break;
    case "I":
      typeSize = 2;
      break;
    case "B":
    case "L":
    case "A":
      typeSize = 1;
      break;
    default:
      typeSize = 1;
  }

  return { size: typeSize * repeat, type, repeat };
}

function readValue(view: DataView, offset: number, type: string): number | null {
  if (offset + (type === "D" ? 8 : 4) > view.byteLength) {
    return null;
  }
  try {
    switch (type) {
      case "D":
        return view.getFloat64(offset, false);
      case "E":
        return view.getFloat32(offset, false);
      case "J":
        return view.getInt32(offset, false);
      case "I":
        return view.getInt16(offset, false);
      case "B":
        return view.getUint8(offset);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function parseHduHeaders(view: DataView, startOffset: number): { headers: Record<string, string>; nextOffset: number } {
  const headers: Record<string, string> = {};
  let offset = startOffset;
  let finished = false;

  while (!finished && offset < view.byteLength) {
    if (offset + 2880 > view.byteLength) {
      break;
    }
    for (let cardIdx = 0; cardIdx < 36; cardIdx++) {
      const cardOffset = offset + cardIdx * 80;
      let cardText = "";
      for (let i = 0; i < 80; i++) {
        cardText += String.fromCharCode(view.getUint8(cardOffset + i));
      }

      const key = cardText.slice(0, 8).trim().toUpperCase();
      if (key === "END") {
        finished = true;
        break;
      }

      if (cardText.includes("=")) {
        const parts = cardText.split("=");
        const cardKey = parts[0].trim().toUpperCase();
        const valPart = parts.slice(1).join("=").trim();
        let val = valPart.split("/")[0].trim();
        if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, val.length - 1).trim();
        }
        headers[cardKey] = val;
      }
    }
    offset += 2880;
  }

  return { headers, nextOffset: offset };
}

interface Column {
  name: string;
  type: string;
  size: number;
  offset: number;
}

export function parseFitsLightCurve(arrayBuffer: ArrayBuffer, filename: string): ParsedLightCurve {
  const view = new DataView(arrayBuffer);
  let offset = 0;
  const time: number[] = [];
  const flux: number[] = [];
  let foundBintable = false;

  while (offset < view.byteLength) {
    const { headers, nextOffset: headerEnd } = parseHduHeaders(view, offset);
    if (headerEnd === offset) {
      break;
    }

    const xtension = (headers["XTENSION"] ?? "").trim().replace(/'/g, "").toUpperCase();
    const naxis = parseInt(headers["NAXIS"] ?? "0", 10);
    const naxis1 = parseInt(headers["NAXIS1"] ?? "0", 10);
    const naxis2 = parseInt(headers["NAXIS2"] ?? "0", 10);

    let dataSize = 0;
    if (naxis > 0) {
      if (xtension === "BINTABLE") {
        dataSize = Math.ceil((naxis1 * naxis2) / 2880) * 2880;
      } else {
        const bitpix = parseInt(headers["BITPIX"] ?? "0", 10);
        let count = 1;
        for (let i = 1; i <= naxis; i++) {
          count *= parseInt(headers[`NAXIS${i}`] ?? "1", 10);
        }
        const bytes = Math.ceil((count * Math.abs(bitpix)) / 8);
        dataSize = Math.ceil(bytes / 2880) * 2880;
      }
    }

    const dataStart = headerEnd;
    const nextHduStart = dataStart + dataSize;

    if (xtension === "BINTABLE" && naxis1 > 0 && naxis2 > 0) {
      foundBintable = true;
      const tfields = parseInt(headers["TFIELDS"] ?? "0", 10);
      const columns: Column[] = [];
      let currentOffset = 0;

      for (let i = 1; i <= tfields; i++) {
        const name = (headers[`TTYPE${i}`] ?? "").trim().toUpperCase();
        const tform = (headers[`TFORM${i}`] ?? "").trim();
        const { size, type } = getColumnFormatSize(tform);

        columns.push({
          name,
          type,
          size,
          offset: currentOffset,
        });

        currentOffset += size;
      }

      let timeCol = columns.find((c) => c.name === "TIME");
      if (!timeCol) timeCol = columns.find((c) => c.name === "TIME_BJD");
      if (!timeCol) timeCol = columns.find((c) => c.name === "BJD");
      if (!timeCol) timeCol = columns.find((c) => c.name === "BTJD");
      if (!timeCol) timeCol = columns.find((c) => c.name.includes("TIME"));

      let fluxCol = columns.find((c) => c.name === "PDCSAP_FLUX");
      if (!fluxCol) fluxCol = columns.find((c) => c.name === "SAP_FLUX");
      if (!fluxCol) fluxCol = columns.find((c) => c.name === "FLUX");
      if (!fluxCol) fluxCol = columns.find((c) => c.name === "LC_INIT");
      if (!fluxCol) fluxCol = columns.find((c) => c.name === "LC_DETREND");
      if (!fluxCol) fluxCol = columns.find((c) => c.name.includes("FLUX"));
      if (!fluxCol) fluxCol = columns.find((c) => c.name.includes("LC_"));

      if (!timeCol || !fluxCol) {
        throw new LightCurveParseError("FITS binary table must include TIME and FLUX columns.");
      }

      for (let rowIdx = 0; rowIdx < naxis2; rowIdx++) {
        const rowStart = dataStart + rowIdx * naxis1;
        if (rowStart + naxis1 > view.byteLength) break;

        const tVal = readValue(view, rowStart + timeCol.offset, timeCol.type);
        const fVal = readValue(view, rowStart + fluxCol.offset, fluxCol.type);

        if (tVal !== null && fVal !== null && Number.isFinite(tVal) && Number.isFinite(fVal)) {
          time.push(tVal);
          flux.push(fVal);
        }
      }

      if (time.length >= 500) {
        break;
      }
    }

    offset = nextHduStart;
  }

  if (!foundBintable) {
    throw new LightCurveParseError("No BINTABLE extension found in FITS file.");
  }

  if (time.length < 500) {
    throw new LightCurveParseError(`Need at least 500 valid data points (found ${time.length}).`);
  }

  const medianFlux = getMedian(flux);
  let normalizedFlux: number[];

  if (Math.abs(medianFlux) < 0.1) {
    // Relative flux deviations centered near 0.0 (e.g. from dvt files)
    normalizedFlux = flux.map((f) => f + 1.0);
  } else {
    // Absolute flux or relative flux centered near median
    normalizedFlux = flux.map((f) => f / medianFlux);
  }

  const fluxMin = Math.min(...normalizedFlux);
  const fluxMax = Math.max(...normalizedFlux);
  if (fluxMin < 0.5 || fluxMax > 1.5) {
    throw new LightCurveParseError(
      "Flux values should be normalized near 1.0 (expected range ~0.5–1.5 after median correction)."
    );
  }

  return { time, flux: normalizedFlux, filename };
}

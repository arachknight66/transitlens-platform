export interface TicTarget {
  id: string;
  name: string;
  description: string;
  sector?: string;
}

export const TIC_LOOKUP: Record<string, TicTarget> = {
  "261136679": {
    id: "261136679",
    name: "Pi Mensae c",
    description: "Known transiting super-Earth (TESS Sector 1)",
    sector: "Sector 1",
  },
  "112838241": {
    id: "112838241",
    name: "WASP-126 b",
    description: "Hot Saturn-mass exoplanet",
    sector: "Sector 1",
  },
  "25155310": {
    id: "25155310",
    name: "WASP-18 b",
    description: "Ultra-hot Jupiter",
    sector: "Sector 2",
  },
};

export const TIC_QUICK_SELECT = [
  TIC_LOOKUP["261136679"],
  TIC_LOOKUP["112838241"],
  TIC_LOOKUP["25155310"],
];

export function sanitizeTicId(raw: string): string {
  return raw.replace(/^TIC[-\s]*/i, "").replace(/\D/g, "");
}

export function lookupTic(id: string): TicTarget | null {
  const clean = sanitizeTicId(id);
  return TIC_LOOKUP[clean] ?? null;
}

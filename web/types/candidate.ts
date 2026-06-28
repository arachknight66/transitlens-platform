export type BlendRisk = "low" | "suspected";
export type FitStatus = "success" | "skipped";
export type ClassFilter =
  | "all"
  | "exoplanet_transit"
  | "eclipsing_binary"
  | "blend_contamination"
  | "stellar_variability_or_other";

export interface CandidateRecord {
  targetId: string;
  predictedClass: string;
  confidence: number;
  periodDays: number | null;
  depth: number | null;
  snr: number | null;
  durationDays: number | null;
  candidateDetected: boolean;
  blendRisk: BlendRisk;
  fitStatus: FitStatus;
  sector: string;
  flags: string[];
}

export type CandidateSortKey =
  | "targetId"
  | "predictedClass"
  | "confidence"
  | "periodDays"
  | "snr";

export interface CandidateFilters {
  classFilter: ClassFilter;
  minSnr: number | null;
  blendRisk: "all" | BlendRisk;
  detection: "all" | "detected" | "not_detected";
  search: string;
}

export const DEFAULT_CANDIDATE_FILTERS: CandidateFilters = {
  classFilter: "all",
  minSnr: null,
  blendRisk: "all",
  detection: "all",
  search: "",
};

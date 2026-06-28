import { resolveClass } from "@/lib/classConfig";
import type {
  CandidateRecord,
  CandidateFilters,
  CandidateSortKey,
} from "@/types/candidate";

export function filterCandidates(
  rows: CandidateRecord[],
  filters: CandidateFilters
): CandidateRecord[] {
  return rows.filter((row) => {
    if (filters.classFilter !== "all") {
      if (resolveClass(row.predictedClass) !== filters.classFilter) return false;
    }
    if (filters.minSnr != null && (row.snr == null || row.snr < filters.minSnr)) {
      return false;
    }
    if (filters.blendRisk !== "all" && row.blendRisk !== filters.blendRisk) {
      return false;
    }
    if (filters.detection === "detected" && !row.candidateDetected) return false;
    if (filters.detection === "not_detected" && row.candidateDetected) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!row.targetId.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function sortCandidates(
  rows: CandidateRecord[],
  key: CandidateSortKey,
  direction: "asc" | "desc"
): CandidateRecord[] {
  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "targetId":
        cmp = a.targetId.localeCompare(b.targetId);
        break;
      case "predictedClass":
        cmp = a.predictedClass.localeCompare(b.predictedClass);
        break;
      case "confidence":
        cmp = (a.confidence ?? 0) - (b.confidence ?? 0);
        break;
      case "periodDays":
        cmp = (a.periodDays ?? -1) - (b.periodDays ?? -1);
        break;
      case "snr":
        cmp = (a.snr ?? -1) - (b.snr ?? -1);
        break;
    }
    return direction === "asc" ? cmp : -cmp;
  });
  return sorted;
}

export function classEmoji(cls: string): string {
  switch (resolveClass(cls)) {
    case "exoplanet_transit":
      return "🪐";
    case "eclipsing_binary":
      return "⭐";
    case "blend_contamination":
      return "🔀";
    default:
      return "📊";
  }
}

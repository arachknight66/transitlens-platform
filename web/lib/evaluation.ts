import type {
  EvaluationMetrics,
  InjectionRecoveryRow,
} from "@/types/evaluation";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function loadEvaluationMetrics(): Promise<EvaluationMetrics | null> {
  try {
    const res = await fetch("/eval/metrics.json");
    if (!res.ok) return null;
    return (await res.json()) as EvaluationMetrics;
  } catch {
    return null;
  }
}

export async function loadInjectionRecoverySummary(): Promise<InjectionRecoveryRow[]> {
  try {
    const res = await fetch("/eval/injection_recovery_summary.csv");
    if (!res.ok) return [];

    const text = await res.text();
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
    return lines.slice(1).map((line) => {
      const cols = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = cols[i] ?? "";
      });
      return {
        scenario: row.scenario ?? "",
        injections: parseInt(row.injections ?? "0", 10),
        recovered: parseInt(row.recovered ?? "0", 10),
        recovery_rate: parseFloat(row.recovery_rate ?? "0"),
        false_positives: parseInt(row.false_positives ?? "0", 10),
        fap_threshold: parseFloat(row.fap_threshold ?? "0"),
      };
    });
  } catch {
    return [];
  }
}

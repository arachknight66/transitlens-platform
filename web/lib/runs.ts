import type { RunsIndex } from "@/types/runs";

export async function loadRuns(): Promise<RunsIndex["runs"]> {
  try {
    const res = await fetch("/runs/runs.json");
    if (!res.ok) return [];
    const data = (await res.json()) as RunsIndex;
    return data.runs.sort((a, b) => b.start_time.localeCompare(a.start_time));
  } catch {
    return [];
  }
}

export function downloadManifest(run: RunsIndex["runs"][0]) {
  const blob = new Blob([JSON.stringify(run, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${run.id}_manifest.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatRunTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function formatRunDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

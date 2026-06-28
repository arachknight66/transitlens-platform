const dataUrlCache = new Map<string, string>();

/** Decode base64 plot payload once and reuse the data URL. */
export function getCachedPlotDataUrl(base64: string, mime = "image/png"): string {
  const key = `${mime}:${base64.length}:${base64.slice(0, 32)}`;
  const existing = dataUrlCache.get(key);
  if (existing) return existing;
  const url = `data:${mime};base64,${base64}`;
  dataUrlCache.set(key, url);
  return url;
}

export function clearPlotCache() {
  dataUrlCache.clear();
}

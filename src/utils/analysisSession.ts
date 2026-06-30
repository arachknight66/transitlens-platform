const CURRENT_ANALYSIS_KEY = 'transitlens.current-analysis';

export const getCurrentAnalysisId = (): string => sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ?? '';

export const setCurrentAnalysisId = (analysisId: string): void => {
  const normalized = analysisId.trim();
  if (normalized) sessionStorage.setItem(CURRENT_ANALYSIS_KEY, normalized);
};


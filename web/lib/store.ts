import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { AnalysisResult } from "@/types/analysis";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const safeStorage = createJSONStorage(() =>
  typeof window !== "undefined" ? localStorage : noopStorage
);

interface TransitStore {
  result: AnalysisResult | null;
  selectedPeriod: number | null;
  analysisRunning: boolean;
  usingFallback: boolean;
  mlcoreConnected: boolean;
  selectedCandidate: "a" | "b" | "c" | null;

  setResult: (result: AnalysisResult) => void;
  setSelectedPeriod: (period: number | null) => void;
  setAnalysisRunning: (running: boolean) => void;
  setUsingFallback: (val: boolean) => void;
  setMlcoreConnected: (val: boolean) => void;
  setSelectedCandidate: (id: "a" | "b" | "c" | null) => void;
  clearResult: () => void;
}

export const useTransitStore = create<TransitStore>()(
  persist(
    (set) => ({
      result: null,
      selectedPeriod: null,
      analysisRunning: false,
      usingFallback: false,
      mlcoreConnected: false,
      selectedCandidate: null,

      setResult: (result) => set({ result, analysisRunning: false }),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setAnalysisRunning: (running) => set({ analysisRunning: running }),
      setUsingFallback: (val) => set({ usingFallback: val }),
      setMlcoreConnected: (val) => set({ mlcoreConnected: val }),
      setSelectedCandidate: (id) => set({ selectedCandidate: id }),
      clearResult: () => set({ result: null, selectedPeriod: null }),
    }),
    {
      name: "transitlens-v1",
      storage: safeStorage,
      partialize: (state) => ({
        result: state.result,
        usingFallback: state.usingFallback,
        selectedCandidate: state.selectedCandidate,
      }),
    }
  )
);

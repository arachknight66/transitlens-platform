"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { LazyPlotImage } from "@/components/ui/LazyPlotImage";
import { getCachedPlotDataUrl } from "@/lib/plotCache";
import type { Plots } from "@/types/analysis";

interface PlotTab {
  id: keyof Plots;
  label: string;
  caption: string;
}

const PLOT_TABS: PlotTab[] = [
  { id: "raw_lightcurve", label: "Raw LC", caption: "Uncorrected flux time series." },
  { id: "cleaned_lightcurve", label: "Cleaned LC", caption: "Detrended and normalized light curve." },
  { id: "periodogram", label: "Periodogram", caption: "Box Least Squares periodogram." },
  { id: "phase_folded", label: "Phase Fold", caption: "Phase-folded transit profile." },
  { id: "transit_stack", label: "Transit Stack", caption: "Individual transits aligned in time." },
  { id: "posterior_corner", label: "Corner", caption: "MCMC posterior corner plot." },
  { id: "alias_comparison", label: "Alias", caption: "Period alias comparison." },
];

interface Props {
  plots: Plots;
}

export function PlotGallery({ plots }: Props) {
  const available = PLOT_TABS.filter((t) => plots[t.id]);
  const [activeId, setActiveId] = useState<keyof Plots>(
    available[0]?.id ?? "raw_lightcurve"
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (available.length && !plots[activeId]) {
      setActiveId(available[0].id);
    }
  }, [plots, activeId, available]);

  const activeTab = PLOT_TABS.find((t) => t.id === activeId) ?? PLOT_TABS[0];
  const activeSrc = plots[activeId];

  const downloadPlot = (id: keyof Plots, label: string) => {
    const b64 = plots[id];
    if (!b64) return;
    const a = document.createElement("a");
    a.href = getCachedPlotDataUrl(b64);
    a.download = `${label.replace(/\s/g, "_").toLowerCase()}.png`;
    a.click();
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => Math.max(0, i - 1));
        setActiveId(available[Math.max(0, lightboxIndex - 1)]?.id ?? activeId);
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => Math.min(available.length - 1, i + 1));
        setActiveId(available[Math.min(available.length - 1, lightboxIndex + 1)]?.id ?? activeId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, lightboxIndex, available, activeId]);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated">
      <div className="flex flex-wrap gap-1 border-b border-border-subtle p-2">
        {PLOT_TABS.map((tab) => {
          const has = !!plots[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              disabled={!has}
              onClick={() => setActiveId(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-fast ${
                activeId === tab.id
                  ? "bg-brand-ghost text-text-primary"
                  : has
                    ? "text-text-secondary hover:bg-white/5"
                    : "cursor-not-allowed text-text-muted opacity-40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {activeSrc ? (
          <>
            <div className="mb-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => downloadPlot(activeId, activeTab.label)}
                className="rounded-md border border-border-soft px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                Download
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(available.findIndex((t) => t.id === activeId));
                  setLightboxOpen(true);
                }}
                className="rounded-md border border-border-soft px-3 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                Full screen
              </button>
            </div>
            <LazyPlotImage base64={activeSrc} alt={`${activeTab.label} plot`} />
            <p className="mt-2 text-xs text-text-muted">{activeTab.caption}</p>
          </>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-border-soft bg-bg-surface text-sm text-text-muted">
            Not available
          </div>
        )}
      </div>

      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <AnimatePresence>
          {lightboxOpen && activeSrc && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-[200] bg-black/90"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLightboxOpen(false)}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  className="fixed inset-4 z-[201] flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Dialog.Title className="sr-only">{activeTab.label}</Dialog.Title>
                  <img
                    src={getCachedPlotDataUrl(activeSrc)}
                    alt={activeTab.label}
                    className="max-h-full max-w-full object-contain"
                    role="img"
                    aria-label={`${activeTab.label} plot full screen`}
                  />
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </div>
  );
}

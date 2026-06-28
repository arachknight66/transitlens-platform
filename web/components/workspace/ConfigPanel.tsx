"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  DEFAULT_CONFIG,
  configSummary,
  type AnalysisConfigForm,
  type FitProfile,
} from "@/lib/analysisConfig";

interface Props {
  value: AnalysisConfigForm;
  onChange: (config: AnalysisConfigForm) => void;
}

export function ConfigPanel({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const { register, watch } = useForm<AnalysisConfigForm>({
    defaultValues: value,
    values: value,
  });

  const formValues = watch();

  const update = (patch: Partial<AnalysisConfigForm>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text-primary"
        aria-expanded={open}
      >
        <span>Advanced Settings</span>
        <span className="text-xs text-text-muted">{configSummary(value)}</span>
      </button>

      {open && (
        <div className="border-t border-border-subtle px-4 py-4">
          <div className="mb-4 flex gap-2">
            {(["quick", "standard", "rigorous"] as FitProfile[]).map((profile) => (
              <button
                key={profile}
                type="button"
                onClick={() => update({ fitProfile: profile })}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-fast ${
                  value.fitProfile === profile
                    ? "bg-brand text-white"
                    : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                }`}
              >
                {profile}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-xs text-text-muted">
              Detrend method
              <select
                {...register("detrendMethod", {
                  onChange: (e) =>
                    update({
                      detrendMethod: e.target.value as AnalysisConfigForm["detrendMethod"],
                    }),
                })}
                className="mt-1 w-full rounded-md border border-border-soft bg-bg-elevated px-2 py-1.5 text-sm text-text-primary"
              >
                <option value="running_median">Running median</option>
                <option value="polynomial">Polynomial</option>
              </select>
            </label>

            <label className="block text-xs text-text-muted" title="Smoothing window for detrending">
              Detrend window (days)
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                {...register("detrendWindowDays", {
                  valueAsNumber: true,
                  onChange: (e) => update({ detrendWindowDays: e.target.valueAsNumber }),
                })}
                className="mt-1 w-full rounded-md border border-border-soft bg-bg-elevated px-2 py-1.5 text-sm tabular-nums text-text-primary"
              />
            </label>

            <label className="block text-xs text-text-muted" title="Minimum BLS search period">
              BLS min period (days)
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register("periodMinDays", {
                  valueAsNumber: true,
                  onChange: (e) => update({ periodMinDays: e.target.valueAsNumber }),
                })}
                className="mt-1 w-full rounded-md border border-border-soft bg-bg-elevated px-2 py-1.5 text-sm tabular-nums text-text-primary"
              />
            </label>

            <label className="block text-xs text-text-muted" title="0 = auto-detect max period">
              BLS max period (days)
              <input
                type="number"
                step="1"
                min="0"
                {...register("periodMaxDays", {
                  valueAsNumber: true,
                  onChange: (e) => update({ periodMaxDays: e.target.valueAsNumber }),
                })}
                placeholder="auto"
                className="mt-1 w-full rounded-md border border-border-soft bg-bg-elevated px-2 py-1.5 text-sm tabular-nums text-text-primary"
              />
            </label>

            <label className="block text-xs text-text-muted">
              BLS power threshold
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="0.5"
                {...register("blsPowerThreshold", {
                  valueAsNumber: true,
                  onChange: (e) => update({ blsPowerThreshold: e.target.valueAsNumber }),
                })}
                className="mt-1 w-full rounded-md border border-border-soft bg-bg-elevated px-2 py-1.5 text-sm tabular-nums text-text-primary"
              />
            </label>

            <label className="block text-xs text-text-muted">
              Random seed
              <input
                type="number"
                min="1"
                max="99999"
                {...register("randomSeed", {
                  valueAsNumber: true,
                  onChange: (e) => update({ randomSeed: e.target.valueAsNumber }),
                })}
                className="mt-1 w-full rounded-md border border-border-soft bg-bg-elevated px-2 py-1.5 text-sm tabular-nums text-text-primary"
              />
            </label>
          </div>

          <p className="mt-3 text-2xs text-text-muted">
            Preview: {configSummary(formValues)}
          </p>
        </div>
      )}

      {!open && (
        <p className="border-t border-border-subtle px-4 py-2 text-xs text-text-muted">
          {configSummary(value)}
        </p>
      )}
    </div>
  );
}

export { DEFAULT_CONFIG };

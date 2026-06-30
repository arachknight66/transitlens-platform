interface ProbabilityGaugeProps {
  readonly label: string;
  readonly value: number;
  readonly accent: string;
}

export const ProbabilityGauge = ({ label, value, accent }: ProbabilityGaugeProps) => {
  const percentage = Math.round(value * 1000) / 10;

  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${accent} ${String(percentage)}%, rgba(148,163,184,0.10) 0)` }}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div className="grid h-[74px] w-[74px] place-items-center rounded-full bg-space-900">
          <span className="font-mono text-lg font-semibold text-white">{percentage.toFixed(1)}%</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-600 uppercase">{label}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">Reported by the active ML Core model.</p>
      </div>
    </div>
  );
};


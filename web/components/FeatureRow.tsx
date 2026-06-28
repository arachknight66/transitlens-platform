"use client";

interface Props {
  name: string;
  value: number | null;
  threshold?: number;
}

export function FeatureRow({ name, value, threshold }: Props) {
  const displayValue = value !== null ? value.toFixed(3) : "—";
  const passes = threshold != null && value != null ? value >= threshold : null;

  return (
    <tr className="border-b border-border-subtle transition-colors hover:bg-white/[0.03]">
      <td className="px-4 py-3 text-sm text-text-secondary">{name}</td>
      <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-text-primary">
        {displayValue}
      </td>
      {threshold !== undefined && (
        <td className="px-4 py-3 text-right text-xs text-text-muted">
          {passes === true && (
            <span className="inline-flex items-center gap-1 text-status-ok">
              <span aria-hidden>✓</span> Pass ≥ {threshold}
            </span>
          )}
          {passes === false && (
            <span className="inline-flex items-center gap-1 text-status-error">
              <span aria-hidden>✗</span> Fail &lt; {threshold}
            </span>
          )}
          {passes === null && "—"}
        </td>
      )}
    </tr>
  );
}

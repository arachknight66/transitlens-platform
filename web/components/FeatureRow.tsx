"use client";
interface Props {
  name: string;
  value: number | null;
  threshold?: number;
}

export function FeatureRow({ name, value, threshold }: Props) {
  const displayValue = value !== null ? value.toFixed(3) : "—";
  const isAboveThreshold = threshold ? value !== null && value >= threshold : undefined;

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
      <td className="px-4 py-3 text-sm text-text-secondary">{name}</td>
      <td className="px-4 py-3 text-right text-sm font-mono text-text-primary">{displayValue}</td>
      {threshold !== undefined && (
        <td className="px-4 py-3 text-right text-sm text-text-muted">
          {isAboveThreshold ? (
            <span className="inline-block h-2 w-2 rounded-full bg-status-green" />
          ) : (
            <span className="inline-block h-2 w-2 rounded-full bg-status-red" />
          )}
        </td>
      )}
    </tr>
  );
}

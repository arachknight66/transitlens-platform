"use client";

import type { PipelineRun } from "@/types/runs";

export function YamlBlock({ source }: { source: string }) {
  const lines = source.split("\n");

  return (
    <pre className="overflow-x-auto rounded-md border border-border-subtle bg-bg-surface p-4 text-xs leading-relaxed">
      <code>
        {lines.map((line, i) => (
          <div key={i} className="font-mono">
            <YamlLine line={line} />
          </div>
        ))}
      </code>
    </pre>
  );
}

function YamlLine({ line }: { line: string }) {
  if (!line.trim()) return <span>&nbsp;</span>;

  const keyMatch = line.match(/^(\s*)([\w.-]+):\s*(.*)$/);
  if (keyMatch) {
    const [, indent, key, value] = keyMatch;
    return (
      <>
        <span>{indent}</span>
        <span className="text-brand-light">{key}</span>
        <span className="text-text-muted">:</span>
        {value && <span className="text-status-ok"> {value}</span>}
      </>
    );
  }

  const listMatch = line.match(/^(\s*)-\s+(.*)$/);
  if (listMatch) {
    const [, indent, value] = listMatch;
    return (
      <>
        <span>{indent}</span>
        <span className="text-text-muted">- </span>
        <span className="text-text-primary">{value}</span>
      </>
    );
  }

  return <span className="text-text-secondary">{line}</span>;
}

export function ArtifactTable({
  artifacts,
  onCopyHash,
}: {
  artifacts: PipelineRun["artifacts"];
  onCopyHash: (hash: string) => void;
}) {
  if (!artifacts.length) {
    return (
      <p className="text-sm text-text-muted">No artifacts registered for this run.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full text-sm">
        <thead className="border-b border-border-subtle bg-bg-surface">
          <tr>
            <th className="px-3 py-2 text-left text-xs text-text-muted">Target</th>
            <th className="px-3 py-2 text-left text-xs text-text-muted">Stage</th>
            <th className="px-3 py-2 text-left text-xs text-text-muted">Path</th>
            <th className="px-3 py-2 text-left text-xs text-text-muted">SHA-256</th>
            <th className="px-3 py-2 text-right text-xs text-text-muted">Size</th>
            <th className="px-3 py-2 text-right text-xs text-text-muted"></th>
          </tr>
        </thead>
        <tbody>
          {artifacts.map((a) => (
            <tr key={`${a.target_id}-${a.relative_path}`} className="border-b border-border-subtle">
              <td className="px-3 py-2 font-mono text-text-primary">{a.target_id}</td>
              <td className="px-3 py-2 text-text-secondary">{a.stage}</td>
              <td className="px-3 py-2 font-mono text-2xs text-text-muted">{a.relative_path}</td>
              <td className="max-w-[140px] truncate px-3 py-2 font-mono text-2xs text-text-muted">
                {a.hash.slice(0, 16)}…
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-text-secondary">
                {a.size_bytes.toLocaleString()} B
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onCopyHash(a.hash)}
                  className="text-xs text-brand hover:underline"
                  aria-label={`Copy hash for ${a.target_id}`}
                >
                  Copy
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

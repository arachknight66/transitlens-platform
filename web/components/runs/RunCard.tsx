"use client";

import { useState } from "react";
import Link from "next/link";
import { downloadManifest, formatRunTime } from "@/lib/runs";
import { ArtifactTable, YamlBlock } from "./RunDetails";
import type { PipelineRun, RunStatus } from "@/types/runs";

const STATUS_STYLE: Record<
  RunStatus,
  { dot: string; label: string; icon: string }
> = {
  SUCCESS: { dot: "bg-status-ok", label: "text-status-ok", icon: "✓" },
  FAILED: { dot: "bg-status-error", label: "text-status-error", icon: "✗" },
  PARTIAL: { dot: "bg-status-warn", label: "text-status-warn", icon: "!" },
};

interface Props {
  run: PipelineRun;
  defaultExpanded?: boolean;
}

export function RunCard({ run, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showConfig, setShowConfig] = useState(false);
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [showEnv, setShowEnv] = useState(false);
  const [rerunOpen, setRerunOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = STATUS_STYLE[run.status];

  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="rounded-lg border border-border-subtle bg-bg-elevated">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col gap-3 p-5 text-left transition-colors hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-mono text-sm font-semibold text-text-primary">{run.id}</h3>
            <p className="mt-1 text-xs text-text-muted">
              Started {formatRunTime(run.start_time)} • Ended {formatRunTime(run.end_time)} •{" "}
              {run.duration_seconds}s
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.label}`}
          >
            <span aria-hidden>{status.icon}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
            {run.status}
          </span>
        </div>

        <p className="text-sm text-text-secondary">
          {run.target_count} target{run.target_count !== 1 ? "s" : ""} • Python{" "}
          {run.python_version} • v{run.pipeline_version}
        </p>
      </button>

      <div className="flex flex-wrap gap-2 border-t border-border-subtle px-5 py-3">
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            setShowConfig((v) => !v);
            setShowArtifacts(false);
          }}
          className="rounded-md border border-border-soft px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          View Config
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            setShowArtifacts((v) => !v);
            setShowConfig(false);
          }}
          className="rounded-md border border-border-soft px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          View Artifacts
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setRerunOpen((v) => !v)}
            className="rounded-md border border-border-soft px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-expanded={rerunOpen}
            aria-haspopup="menu"
          >
            Re-run ▾
          </button>
          {rerunOpen && (
            <div
              className="absolute left-0 top-full z-10 mt-1 min-w-[160px] rounded-md border border-border-soft bg-bg-overlay py-1 shadow-card"
              role="menu"
            >
              <Link
                href="/analyze"
                className="block px-3 py-2 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary"
                role="menuitem"
                onClick={() => setRerunOpen(false)}
              >
                Open workspace
              </Link>
              <Link
                href={`/results/candidate_a`}
                className="block px-3 py-2 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary"
                role="menuitem"
                onClick={() => setRerunOpen(false)}
              >
                View last demo result
              </Link>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => downloadManifest(run)}
          className="ml-auto rounded-md border border-border-soft px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Download manifest
        </button>
      </div>

      {copied && (
        <p className="px-5 pb-2 text-2xs text-status-ok" role="status">
          Hash copied to clipboard
        </p>
      )}

      {expanded && (
        <div className="space-y-4 border-t border-border-subtle px-5 py-4">
          {showConfig && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-text-primary">
                Resolved configuration
              </h4>
              <YamlBlock source={run.resolved_config_yaml} />
            </section>
          )}

          {showArtifacts && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-text-primary">Artifacts</h4>
              <ArtifactTable artifacts={run.artifacts} onCopyHash={copyHash} />
            </section>
          )}

          <section>
            <button
              type="button"
              onClick={() => setShowEnv((v) => !v)}
              className="mb-2 text-sm font-semibold text-text-primary hover:text-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-expanded={showEnv}
            >
              Environment {showEnv ? "▾" : "▸"}
            </button>
            {showEnv && (
              <pre className="overflow-x-auto rounded-md border border-border-subtle bg-bg-surface p-4 text-xs text-text-secondary">
                {JSON.stringify(run.environment, null, 2)}
              </pre>
            )}
          </section>
        </div>
      )}
    </article>
  );
}

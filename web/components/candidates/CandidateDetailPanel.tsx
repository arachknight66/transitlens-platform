"use client";

import Link from "next/link";
import { ClassBadge } from "@/components/ClassBadge";
import { formatPeriod } from "@/lib/formatters";
import { classEmoji } from "@/lib/candidateUtils";
import type { CandidateRecord } from "@/types/candidate";
import type { Annotation } from "@/types/analysis";

interface Props {
  candidate: CandidateRecord;
  onClose: () => void;
  annotation?: Annotation;
}

export function CandidateDetailPanel({ candidate, onClose, annotation }: Props) {
  return (
    <aside className="flex h-full flex-col border-l border-border-subtle bg-bg-elevated">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h3 className="font-semibold text-text-primary">Candidate detail</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text-primary"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <p className="text-xs text-text-muted">Target</p>
          <p className="font-mono text-lg font-semibold text-text-primary">
            {classEmoji(candidate.predictedClass)} {candidate.targetId}
          </p>
        </div>

        <ClassBadge predictedClass={candidate.predictedClass} size="md" />

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-text-muted">Confidence</dt>
            <dd className="tabular-nums text-text-primary">
              {Math.round(candidate.confidence * 100)}%
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">SNR</dt>
            <dd className="tabular-nums text-text-primary">
              {candidate.snr?.toFixed(1) ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Period</dt>
            <dd className="tabular-nums text-text-primary">
              {formatPeriod(candidate.periodDays)}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Blend risk</dt>
            <dd className="capitalize text-text-primary">{candidate.blendRisk}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Fit status</dt>
            <dd className="uppercase text-text-primary">{candidate.fitStatus}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Sector</dt>
            <dd className="text-text-primary">{candidate.sector}</dd>
          </div>
        </dl>

        {candidate.flags.length > 0 && (
          <div>
            <p className="mb-1 text-xs text-text-muted">Flags</p>
            <div className="flex flex-wrap gap-1">
              {candidate.flags.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-status-warn/15 px-2 py-0.5 text-2xs text-status-warn"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {annotation?.flagged && (
          <div className="rounded-md border border-border-soft bg-white/5 p-3 space-y-2">
            <p className="font-semibold text-xs text-text-primary flex items-center gap-1.5">
              <span>🚩</span> Review Flag
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-text-muted block">Priority</span>
                <span className="text-status-error font-medium">{annotation.priority}</span>
              </div>
              <div>
                <span className="text-text-muted block">Category</span>
                <span className="text-brand-light font-medium">{annotation.category}</span>
              </div>
            </div>
            {annotation.notes && (
              <div>
                <span className="text-text-muted text-xs block">Notes</span>
                <p className="text-xs text-text-secondary mt-0.5 whitespace-pre-wrap">{annotation.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle p-4">
        <Link
          href={`/results/${candidate.targetId}`}
          className="block w-full rounded-md bg-brand py-2 text-center text-sm font-medium text-white hover:bg-brand-core"
        >
          View full results
        </Link>
      </div>
    </aside>
  );
}

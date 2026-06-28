"use client";

import { motion } from "framer-motion";
import { formatUncertainty } from "@/lib/formatters";

interface Props {
  label: string;
  value: string | number | null;
  errLower?: number | null;
  errUpper?: number | null;
  errSym?: number | null;
  unit?: string;
  quality?: "ok" | "warn" | "error";
  help?: string;
}

const QUALITY_BORDER = {
  ok: "border-l-status-ok",
  warn: "border-l-status-warn",
  error: "border-l-status-error",
};

const QUALITY_DOT = {
  ok: "bg-status-ok",
  warn: "bg-status-warn",
  error: "bg-status-error",
};

export function ParameterCard({
  label,
  value,
  errLower,
  errUpper,
  errSym,
  unit,
  quality = "ok",
  help,
}: Props) {
  const uncertainty = formatUncertainty(errUpper, errLower, errSym);

  return (
    <motion.div
      className={`relative flex flex-col gap-1 rounded-lg border border-border-subtle border-l-[3px] bg-bg-elevated p-4 ${QUALITY_BORDER[quality]}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      title={help}
    >
      <span
        className={`absolute right-3 top-3 h-1.5 w-1.5 rounded-full ${QUALITY_DOT[quality]}`}
        aria-hidden
      />
      <span className="text-xs text-text-muted">{label}</span>
      <div className="flex items-baseline gap-2 tabular-nums">
        <span className="font-mono text-xl font-semibold text-text-primary">
          {value ?? "—"}
        </span>
        {unit && <span className="text-xs text-text-secondary">{unit}</span>}
      </div>
      {uncertainty && (
        <span className="font-mono text-xs text-status-ok">{uncertainty}</span>
      )}
    </motion.div>
  );
}

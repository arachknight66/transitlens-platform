"use client";
import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string | number | null;
  unit?: string;
  delta?: string;
  help?: string;
}

export function ParameterCard({ label, value, unit, delta, help }: Props) {
  return (
    <motion.div
      className="flex flex-col gap-2 rounded-lg border border-gray-800 bg-bg-card p-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      title={help}
    >
      <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-heading font-semibold text-text-primary">
          {value ?? "—"}
        </span>
        {unit && <span className="text-xs text-text-secondary">{unit}</span>}
      </div>
      {delta && <span className="text-xs text-text-secondary">{delta}</span>}
    </motion.div>
  );
}

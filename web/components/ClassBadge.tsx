"use client";
import { motion } from "framer-motion";
import { getClassConfig } from "@/lib/classConfig";

interface Props {
  predictedClass: string;
  size?: "sm" | "md" | "lg";
}

const SIZE = {
  sm: { px: "px-2 py-0.5", text: "text-xs" },
  md: { px: "px-3 py-1", text: "text-sm" },
  lg: { px: "px-4 py-1.5", text: "text-base" },
};

export function ClassBadge({ predictedClass, size = "md" }: Props) {
  const cfg = getClassConfig(predictedClass);
  const s = SIZE[size];

  return (
    <motion.span
      className={`inline-flex items-center rounded-full font-medium text-white ${s.px} ${s.text}`}
      style={{ backgroundColor: cfg.colorHex }}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      aria-label={`Classification: ${cfg.display}`}
    >
      {cfg.display}
    </motion.span>
  );
}

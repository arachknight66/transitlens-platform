"use client";
import { motion } from "framer-motion";

interface Props {
  height?: string;
  className?: string;
}

export function SkeletonCard({ height = "300px", className = "" }: Props) {
  return (
    <motion.div
      className={`w-full rounded-lg bg-gradient-to-r from-bg-card via-gray-700 to-bg-card bg-[length:200%_100%] ${className}`}
      style={{ height }}
      animate={{ backgroundPosition: ["200% center", "-200% center"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
  );
}

"use client";
import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: Props) {
  return (
    <motion.div
      className="border-b border-gray-800 px-6 py-8"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-heading-xl font-bold text-text-primary">{title}</h1>
      {subtitle && <p className="mt-1 text-body text-text-secondary">{subtitle}</p>}
    </motion.div>
  );
}

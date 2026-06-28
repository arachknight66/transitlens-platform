"use client";
import { motion } from "framer-motion";

interface Props {
  title: string;
  imageSrc?: string;
  children?: React.ReactNode;
  index?: number;
}

export function PlotContainer({ title, imageSrc, children, index = 0 }: Props) {
  return (
    <motion.div
      className="overflow-hidden rounded-lg border border-gray-800 bg-bg-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="border-b border-gray-800 px-6 py-4">
        <h3 className="font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="p-6">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full rounded-md"
          />
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

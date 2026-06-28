"use client";
import { motion } from "framer-motion";
import { LazyPlotImage } from "@/components/ui/LazyPlotImage";

interface Props {
  title: string;
  imageSrc?: string;
  base64?: string;
  children?: React.ReactNode;
  index?: number;
}

export function PlotContainer({ title, imageSrc, base64, children, index = 0 }: Props) {
  const b64 = base64 ?? (imageSrc?.startsWith("data:image/png;base64,")
    ? imageSrc.replace("data:image/png;base64,", "")
    : undefined);

  return (
    <motion.div
      className="overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="border-b border-border-subtle px-6 py-4">
        <h3 className="font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="p-6">
        {b64 ? (
          <LazyPlotImage base64={b64} alt={`${title} plot`} />
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt={`${title} plot`}
            className="w-full rounded-md"
            role="img"
            aria-label={`${title} plot`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

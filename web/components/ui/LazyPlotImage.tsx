"use client";

import { useEffect, useRef, useState } from "react";
import { getCachedPlotDataUrl } from "@/lib/plotCache";

interface Props {
  base64: string;
  alt: string;
  className?: string;
  rootMargin?: string;
}

export function LazyPlotImage({
  base64,
  alt,
  className = "w-full rounded-md",
  rootMargin = "200px",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const dataUrlRef = useRef<string | null>(null);

  if (!dataUrlRef.current) {
    dataUrlRef.current = getCachedPlotDataUrl(base64);
  }

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={containerRef} className="min-h-[120px]">
      {visible ? (
        <img
          src={dataUrlRef.current!}
          alt={alt}
          className={className}
          role="img"
          aria-label={alt}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="flex h-[200px] items-center justify-center rounded-md bg-bg-surface text-xs text-text-muted"
          aria-hidden
        >
          Loading plot…
        </div>
      )}
    </div>
  );
}

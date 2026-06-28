"use client";

import { PageHeader } from "@/components/layout/PageHeader";

export default function MethodPage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Method"
          subtitle="Pipeline configuration, detection thresholds, and classification rules."
        />

        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-8 text-center">
          <p className="text-base text-text-secondary">
            Method documentation interface coming soon…
          </p>
        </div>
      </div>
    </div>
  );
}

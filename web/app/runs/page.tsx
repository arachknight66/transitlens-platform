"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { RunsTimeline } from "@/components/runs/RunsTimeline";

export default function RunsPage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Runs History"
          subtitle="Pipeline run timeline with resolved configs, environment metadata, and artifact checksums."
        />
        <RunsTimeline />
      </div>
    </div>
  );
}

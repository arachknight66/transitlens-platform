"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { CandidateExplorer } from "@/components/candidates/CandidateExplorer";

export default function CandidatesPage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          title="Candidate Explorer"
          subtitle="Browse, filter, and compare processed targets across evaluation splits and gold samples."
        />
        <CandidateExplorer />
      </div>
    </div>
  );
}

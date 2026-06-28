"use client";

import { useEffect, useState } from "react";
import type { Annotation } from "@/types/analysis";

interface Props {
  targetId: string;
  onAnnotationChange?: (annotation: Annotation | null) => void;
}

export function AnnotationPanel({ targetId, onAnnotationChange }: Props) {
  const [flagged, setFlagged] = useState(false);
  const [priority, setPriority] = useState<Annotation["priority"]>("Medium");
  const [category, setCategory] = useState<Annotation["category"]>("Needs follow-up");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("transitlens-annotations");
    if (raw) {
      try {
        const dict = JSON.parse(raw) as Record<string, Annotation>;
        const ann = dict[targetId];
        if (ann) {
          setFlagged(ann.flagged);
          setPriority(ann.priority);
          setCategory(ann.category);
          setNotes(ann.notes);
        } else {
          setFlagged(false);
          setPriority("Medium");
          setCategory("Needs follow-up");
          setNotes("");
        }
      } catch {
        // Ignore
      }
    }
  }, [targetId]);

  const save = (
    nextFlagged: boolean,
    nextPriority: Annotation["priority"],
    nextCategory: Annotation["category"],
    nextNotes: string
  ) => {
    const raw = localStorage.getItem("transitlens-annotations");
    const dict = raw ? (JSON.parse(raw) as Record<string, Annotation>) : {};

    if (nextFlagged) {
      const ann: Annotation = {
        targetId,
        flagged: true,
        priority: nextPriority,
        category: nextCategory,
        notes: nextNotes,
        updatedAt: new Date().toISOString(),
      };
      dict[targetId] = ann;
      localStorage.setItem("transitlens-annotations", JSON.stringify(dict));
      if (onAnnotationChange) onAnnotationChange(ann);
    } else {
      delete dict[targetId];
      localStorage.setItem("transitlens-annotations", JSON.stringify(dict));
      if (onAnnotationChange) onAnnotationChange(null);
    }
  };

  const handleFlagToggle = (val: boolean) => {
    setFlagged(val);
    save(val, priority, category, notes);
  };

  const handlePriorityChange = (val: Annotation["priority"]) => {
    setPriority(val);
    save(flagged, val, category, notes);
  };

  const handleCategoryChange = (val: Annotation["category"]) => {
    setCategory(val);
    save(flagged, priority, val, notes);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    save(flagged, priority, category, val);
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading font-semibold text-text-primary flex items-center gap-2">
          <span>🚩</span> Review & Annotate
        </h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary select-none">
          <input
            type="checkbox"
            checked={flagged}
            onChange={(e) => handleFlagToggle(e.target.checked)}
            className="accent-brand h-4 w-4 rounded border-border-soft bg-bg-surface focus:ring-brand"
          />
          Flag this target for review
        </label>
      </div>

      {flagged && (
        <div className="mt-4 space-y-4 animate-fadeInUp">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value as Annotation["priority"])}
                className="w-full rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as Annotation["category"])}
                className="w-full rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="Promising">Promising Candidate</option>
                <option value="Needs follow-up">Needs Follow-Up</option>
                <option value="False positive">False Positive</option>
                <option value="Unclear">Unclear / Ambiguous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Reviewer Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Enter vetting details, stellar characteristics, secondary eclipse findings, or background sources..."
              rows={3}
              className="w-full rounded-md border border-border-soft bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}

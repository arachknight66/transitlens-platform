"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useTransitStore } from "@/lib/store";

interface CommandItem {
  id: string;
  label: string;
  group: string;
  keywords?: string;
  action: () => void;
}

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const result = useTransitStore((s) => s.result);
  const mlcoreConnected = useTransitStore((s) => s.mlcoreConnected);
  const setMlcoreConnected = useTransitStore((s) => s.setMlcoreConnected);

  const items = useMemo<CommandItem[]>(() => {
    const nav: CommandItem[] = [
      {
        id: "nav-analyze",
        label: "Go to Analyze",
        group: "Navigate",
        keywords: "analysis workspace",
        action: () => router.push("/analyze"),
      },
      {
        id: "nav-candidates",
        label: "Go to Candidates",
        group: "Navigate",
        keywords: "explorer targets",
        action: () => router.push("/candidates"),
      },
      {
        id: "nav-evaluation",
        label: "Go to Evaluation",
        group: "Navigate",
        keywords: "metrics dashboard",
        action: () => router.push("/evaluation"),
      },
      {
        id: "nav-runs",
        label: "Go to Runs",
        group: "Navigate",
        keywords: "history pipeline",
        action: () => router.push("/runs"),
      },
      {
        id: "nav-method",
        label: "Go to Method",
        group: "Navigate",
        keywords: "settings configuration",
        action: () => router.push("/method"),
      },
    ];

    const analysis: CommandItem[] = ["a", "b", "c"].map((id) => ({
      id: `run-${id}`,
      label: `Run analysis on Candidate ${id.toUpperCase()}`,
      group: "Analysis",
      keywords: `candidate_${id} demo`,
      action: () => router.push("/analyze"),
    }));

    const actions: CommandItem[] = [];

    if (result) {
      actions.push({
        id: "export-json",
        label: "Export last result as JSON",
        group: "Actions",
        keywords: "download save",
        action: () => {
          const blob = new Blob([JSON.stringify(result, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${result.target_id}_result.json`;
          a.click();
          URL.revokeObjectURL(url);
        },
      });
    }

    actions.push({
      id: "toggle-connection",
      label: `Connection: ${mlcoreConnected ? "Connected" : "Disconnected"} (toggle display)`,
      group: "Actions",
      keywords: "ml-core health status",
      action: () => setMlcoreConnected(!mlcoreConnected),
    });

    return [...nav, ...analysis, ...actions];
  }, [router, result, mlcoreConnected, setMlcoreConnected]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter(
      (item) =>
        fuzzyMatch(query, item.label) ||
        fuzzyMatch(query, item.group) ||
        (item.keywords && fuzzyMatch(query, item.keywords))
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, open]);

  const runSelected = useCallback(
    (index: number) => {
      const item = filtered[index];
      if (!item) return;
      item.action();
      setOpen(false);
      setQuery("");
    },
    [filtered]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        runSelected(selectedIndex);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered.length, selectedIndex, runSelected]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return map;
  }, [filtered]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-[100] bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border-soft bg-bg-elevated shadow-card-hover"
                initial={{ opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <Dialog.Title className="sr-only">Command palette</Dialog.Title>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands…"
                  className="w-full border-b border-border-subtle bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                  autoFocus
                />
                <div className="max-h-72 overflow-y-auto p-2">
                  {filtered.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-text-muted">
                      No matching commands
                    </p>
                  ) : (
                    Array.from(grouped.entries()).map(([group, groupItems]) => (
                      <div key={group} className="mb-2">
                        <p className="px-3 py-1 text-2xs font-medium uppercase tracking-wider text-text-muted">
                          {group}
                        </p>
                        {groupItems.map((item) => {
                          const index = filtered.indexOf(item);
                          const isSelected = index === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors duration-fast ${
                                isSelected
                                  ? "bg-brand-ghost text-text-primary"
                                  : "text-text-secondary hover:bg-white/5"
                              }`}
                              onMouseEnter={() => setSelectedIndex(index)}
                              onClick={() => runSelected(index)}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-border-subtle px-4 py-2 text-2xs text-text-muted">
                  <span className="mr-4">↑↓ navigate</span>
                  <span className="mr-4">↵ select</span>
                  <span>esc close</span>
                  <span className="float-right">⌘K</span>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

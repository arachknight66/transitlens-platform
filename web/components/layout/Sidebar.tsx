"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { healthCheck } from "@/lib/api";
import { useTransitStore } from "@/lib/store";

const ML_CORE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Navigation",
    items: [
      { href: "/analyze", label: "Analyze", icon: "🔭" },
      { href: "/candidates", label: "Candidates", icon: "🗂️" },
    ],
  },
  {
    title: "Science",
    items: [
      { href: "/evaluation", label: "Evaluation", icon: "📊" },
      { href: "/runs", label: "Runs", icon: "📋" },
      { href: "/method", label: "Method", icon: "⚙️" },
    ],
  },
];

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors duration-fast ${
        isActive
          ? "border-brand bg-brand-ghost text-text-primary"
          : "border-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <span aria-hidden="true">{item.icon}</span>
      {item.label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const mlcoreConnected = useTransitStore((s) => s.mlcoreConnected);
  const setMlcoreConnected = useTransitStore((s) => s.setMlcoreConnected);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const ok = await healthCheck();
      if (!cancelled) setMlcoreConnected(ok);
    }

    check();
    const interval = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setMlcoreConnected]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-lg font-bold text-text-primary">TransitLens</h1>
        <p className="text-xs text-text-secondary">Exoplanet Detection</p>
      </div>

      <nav className="flex-1 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-2xs font-medium uppercase tracking-wider text-text-muted">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={
                    pathname === item.href ||
                    (item.href !== "/analyze" && pathname.startsWith(item.href))
                  }
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-border-subtle pt-4">
        <div className="flex items-center gap-2 px-3">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              mlcoreConnected ? "bg-status-ok" : "bg-status-error"
            }`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-2xs text-text-muted">ml-core status</p>
            <p className="truncate font-mono text-2xs text-text-secondary">
              {ML_CORE_URL.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-border-soft bg-bg-surface text-text-primary md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          />
        </svg>
      </button>

      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-border-subtle bg-bg-base p-6">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border-subtle bg-bg-base p-6 md:hidden"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-label="Navigation menu"
            >
              <button
                type="button"
                className="absolute right-4 top-4 text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                onClick={closeMobile}
                aria-label="Close navigation menu"
              >
                ✕
              </button>
              <SidebarContent onNavigate={closeMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

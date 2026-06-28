"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { PageTransition } from "./PageTransition";
import { CommandPalette } from "./CommandPalette";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <CommandPalette />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto pt-14 md:pl-64 md:pt-0 focus-visible:outline-none"
          tabIndex={-1}
        >
          <AnimatePresence mode="wait">
            <ErrorBoundary key={pathname}>
              <PageTransition>{children}</PageTransition>
            </ErrorBoundary>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

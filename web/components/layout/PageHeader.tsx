"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="mb-8">
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-2 text-xs text-text-muted">
          <li>
            <Link
              href="/analyze"
              className="transition-colors duration-fast hover:text-text-secondary"
            >
              TransitLens
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-text-secondary" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-base text-text-secondary">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { BrandMark } from '../components/BrandMark';
import { Navigation } from '../components/Navigation';
import { applyTheme, readPreferences } from '../utils/preferences';

export const AppShell = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    applyTheme(readPreferences().theme);
  }, []);

  return (
    <div className="min-h-screen bg-space-950 text-slate-100">
      <a href="#main-content" className="sr-only z-50 rounded bg-signal-300 px-4 py-2 text-space-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/8 bg-space-950/95 px-4 backdrop-blur lg:hidden">
        <BrandMark />
        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            setIsMenuOpen((open) => !open);
          }}
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/8 bg-space-900 px-5 py-6 lg:flex">
        <BrandMark />
        <Navigation />
      </aside>

      {isMenuOpen && (
        <div id="mobile-navigation" className="fixed inset-x-0 top-16 z-20 border-b border-white/8 bg-space-900 px-5 py-5 shadow-2xl lg:hidden">
          <Navigation onNavigate={() => {
            setIsMenuOpen(false);
          }} />
        </div>
      )}

      <main id="main-content" className="min-h-screen lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

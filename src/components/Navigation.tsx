import { NavLink } from 'react-router-dom';

interface NavigationProps {
  readonly onNavigate?: () => void;
}

const activeItems = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'MAST Explorer', to: '/mast' },
  { label: 'Upload', to: '/upload' },
  { label: 'Analysis', to: '/analysis' },
  { label: 'Results', to: '/results' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' },
  { label: 'About', to: '/about' },
] as const;

export const Navigation = ({ onNavigate }: NavigationProps) => (
  <nav aria-label="Primary navigation" className="mt-9 flex flex-1 flex-col">
    <p className="px-3 text-[10px] font-semibold tracking-[0.2em] text-slate-600 uppercase">Workspace</p>
    <ul className="mt-3 space-y-1">
      {activeItems.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-signal-400/10 font-medium text-signal-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-signal-400 shadow-[0_0_8px_#45d6c5]' : 'bg-slate-700'}`} aria-hidden="true" />
                {item.label}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
    <div className="mt-auto rounded-xl border border-white/6 bg-white/[0.025] p-3">
      <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase">Workspace mode</p>
      <p className="mt-1.5 text-xs text-slate-400">Scientific analysis</p>
    </div>
  </nav>
);

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

const ProjectSetupPage = lazy(() => import('../pages/ProjectSetupPage'));

const loadingFallback = (
  <div className="grid min-h-screen place-items-center bg-space-950 text-sm text-slate-300" role="status">
    Loading TransitLens…
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Suspense fallback={loadingFallback}><ProjectSetupPage /></Suspense>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);


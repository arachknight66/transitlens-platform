import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '../layouts/AppShell';

const HomePage = lazy(() => import('../pages/HomePage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const MastExplorerPage = lazy(() => import('../pages/MastExplorerPage'));
const UploadPage = lazy(() => import('../pages/UploadPage'));
const AnalysisPage = lazy(() => import('../pages/AnalysisPage'));
const ResultsPage = lazy(() => import('../pages/ResultsPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));

const loadingFallback = (
  <div className="grid min-h-screen place-items-center bg-space-950 text-sm text-slate-300" role="status">
    Loading TransitLens…
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Suspense fallback={loadingFallback}><HomePage /></Suspense>,
      },
      {
        path: 'dashboard',
        element: <Suspense fallback={loadingFallback}><DashboardPage /></Suspense>,
      },
      {
        path: 'mast',
        element: <Suspense fallback={loadingFallback}><MastExplorerPage /></Suspense>,
      },
      {
        path: 'upload',
        element: <Suspense fallback={loadingFallback}><UploadPage /></Suspense>,
      },
      {
        path: 'analysis',
        element: <Suspense fallback={loadingFallback}><AnalysisPage /></Suspense>,
      },
      {
        path: 'results',
        element: <Suspense fallback={loadingFallback}><ResultsPage /></Suspense>,
      },
      {
        path: 'reports',
        element: <Suspense fallback={loadingFallback}><ReportsPage /></Suspense>,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

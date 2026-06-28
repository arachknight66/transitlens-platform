"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-status-error/10 text-2xl"
        aria-hidden
      >
        ⚠
      </div>
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Something went wrong</h2>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          {error?.message ?? "An unexpected error occurred in this section."}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-core focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        Retry
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorBoundaryRetry onRetry={this.handleRetry} error={this.state.error} />
      );
    }
    return this.props.children;
  }
}

function ErrorBoundaryRetry({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorFallback
      error={error}
      onRetry={() => {
        onRetry();
        router.refresh();
      }}
    />
  );
}

'use client';

// components/global/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Optional label that appears in the fallback UI, e.g. "Map" or "Reviews" */
  label?: string;
  /** Compact mode — use for small sections like swipers */
  compact?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleReset = () => this.setState({ hasError: false, error: undefined });

  public render() {
    if (!this.state.hasError) return this.props.children;

    const { label = 'section', compact = false } = this.props;

    if (compact) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center rounded-xl border border-brand-border dark:border-brand-border-dark bg-surface/50 dark:bg-surface-dark/50">
          <AlertTriangle className="w-8 h-8 text-accent" />
          <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70">
            Could not load {label}. Please try again.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 text-primary font-bold text-sm hover:underline"
          >
            <RefreshCw size={14} /> Reload {label}
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-xl m-4">
        <AlertTriangle className="w-12 h-12 text-accent mb-4" />
        <h2 className="text-2xl font-outfit font-bold mb-2">Something went wrong</h2>
        <p className="text-brand-text/70 dark:text-brand-text-dark/70 font-inter mb-6 max-w-md">
          The <strong>{label}</strong> failed to load. Your other content is still available.
        </p>
        <button onClick={this.handleReset} className="btn-primary flex items-center gap-2">
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }
}

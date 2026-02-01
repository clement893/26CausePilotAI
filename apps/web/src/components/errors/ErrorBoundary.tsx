/**
 * Error Boundary Component with Sentry Integration
 *
 * Catches React component errors and displays a fallback UI.
 * Automatically reports errors to Sentry for monitoring.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomError />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With error handler
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     logger.error('','Caught error:', error);
 *   }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { logger, type LogContext } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface Props {
  /** Child components to wrap */
  children: ReactNode;
  /** Custom fallback UI to display on error */
  fallback?: ReactNode;
  /** Error handler callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Show error details in UI */
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: true,
      },
    });

    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('ErrorBoundary caught an error', error, errorInfo as LogContext);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0F]">
          <Card variant="glass" className="max-w-2xl w-full border border-gray-800">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                <p className="text-gray-400 mt-2">
                  We're sorry, but something unexpected happened. Our team has been notified.
                </p>
              </div>

              {this.state.eventId && <Alert variant="info">Error ID: {this.state.eventId}</Alert>}

              {this.props.showDetails && this.state.error && (
                <div className="glass-effect bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">
                    Error Details
                  </h3>
                  <pre className="text-xs text-red-300 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack && (
                      <div className="mt-2 pt-2 border-t border-red-500/50">
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="gradient" onClick={this.handleReset}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleReload} className="border-gray-700 text-gray-300 hover:bg-[#252532]">
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to manually trigger error boundary
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    Sentry.captureException(error, {
      contexts: {
        react: errorInfo
          ? {
              componentStack: errorInfo.componentStack,
            }
          : undefined,
      },
    });
  };
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Send to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId, errorInfo });
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReportFeedback = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({
        eventId: this.state.eventId,
        title: 'It looks like we\'re having issues.',
        subtitle: 'Our team has been notified.',
        subtitle2: 'If you\'d like to help, tell us what happened below.',
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <AlertTriangle className="error-icon" size={64} />
            <h1>Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry for the inconvenience. Our team has been notified and is working on a fix.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-primary">
                <RefreshCw size={20} />
                Try Again
              </button>
              <button onClick={() => window.location.href = '/'} className="btn-secondary">
                <Home size={20} />
                Go Home
              </button>
              {this.state.eventId && (
                <button onClick={this.handleReportFeedback} className="btn-secondary">
                  Report Issue
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap with Sentry's error boundary for better integration
export const SentryErrorBoundary = Sentry.withErrorBoundary(ErrorBoundary, {
  fallback: ({ error, resetError }) => (
    <div className="error-boundary-container">
      <div className="error-boundary-content">
        <AlertTriangle className="error-icon" size={64} />
        <h1>Application Error</h1>
        <p>An unexpected error occurred: {error.message}</p>
        <button onClick={resetError} className="btn-primary">
          <RefreshCw size={20} />
          Reset Application
        </button>
      </div>
    </div>
  ),
  showDialog: true, // Show Sentry feedback dialog
});

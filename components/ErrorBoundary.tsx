"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary komponenta za hvatanje React grešaka
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error (može se poslati na monitoring servis)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // U produkciji, možemo poslati na error tracking servis
    if (process.env.NODE_ENV === "production") {
      // TODO: Integracija s Sentry ili sličnim servisom
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gf-bg dark:bg-neutral-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Nešto je pošlo po zlu
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
              Došlo je do neočekivane greške. Molimo pokušajte osvježiti stranicu.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Detalji greške (samo u development modu)
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-neutral-900 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full mt-4 px-4 py-2 bg-gf-primary text-white rounded-lg hover:bg-gf-primary-dark transition-colors"
            >
              Osvježi stranicu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


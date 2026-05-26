/**
 * Admin Error Boundary
 * 
 * Error boundary specifically for admin dashboard pages.
 * Provides retry functionality and detailed error information for critical admin operations.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console for debugging
    console.error("Admin Error Boundary caught an error:", error, errorInfo);

    // Optionally send error to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/dashboard/admin";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-[var(--text)] text-center mb-4 font-hind">
                অ্যাডমিন ড্যাশবোর্ডে একটি সমস্যা হয়েছে
              </h1>

              {/* Error Message */}
              <p className="text-[var(--text)]/70 text-center mb-6 font-hind">
                দুঃখিত, অ্যাডমিন পেজ লোড করতে একটি ত্রুটি হয়েছে। আপনি নিচের অপশনগুলি থেকে চেষ্টা করতে পারেন।
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2 font-hind">
                    ত্রুটি বিবরণ:
                  </p>
                  <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40 font-hind">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40 mt-2 font-hind">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center gap-2 font-hind"
                >
                  <RefreshCw size={18} />
                  পুনরায় চেষ্টা করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 font-hind"
                >
                  <Home size={18} />
                  অ্যাডমিন ড্যাশবোর্ডে ফিরুন
                </Button>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
                <p className="text-sm text-[var(--text)]/50 font-hind">
                  যদি সমস্যাটি অব্যাহত থাকে, অনুগ্রহ করে সিস্টেম অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

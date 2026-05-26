"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--text)] font-hind">
                কিছু ভুল হয়েছে
              </h2>
              <p className="text-[var(--text)]/60 font-hind">
                আমরা দুঃখিত, কিন্তু একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
                <p className="text-sm text-red-600 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              পুনরায় চেষ্টা করুন
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

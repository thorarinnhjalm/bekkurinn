'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console (in production, you might send to error tracking service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // TODO: Send to error tracking service (Sentry, etc)
        // if (process.env.NODE_ENV === 'production') {
        //     Sentry.captureException(error, { extra: errorInfo });
        // }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Úps! Eitthvað fór úrskeiðis
                        </h1>

                        <p className="text-gray-600 mb-6">
                            Ekki hafa áhyggjur — gögnin þín eru óhult.
                            Reyndu að endurhlaða síðuna.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                                <p className="text-xs font-mono text-red-600 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw size={20} />
                                Reyndu aftur
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Fara heim
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-6">
                            Ef vandamálið er viðvarandi, hafðu samband við stuðning.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Smaller error boundary for inline components
 */
export function InlineErrorBoundary({ children, fallback }: Props) {
    return (
        <ErrorBoundary
            fallback={
                fallback || (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">
                            An error occurred loading this section.
                        </p>
                    </div>
                )
            }
        >
            {children}
        </ErrorBoundary>
    );
}

'use client';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="card bg-white/90 backdrop-blur-sm border-red-200">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Oops! Something went wrong
                </h1>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  We encountered an unexpected error. This has been logged and our team will investigate.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
                    <pre className="text-sm text-gray-600 overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700">
                          Component Stack
                        </summary>
                        <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>

                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center justify-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * Catches runtime errors (including failed dynamic imports) and shows a fallback UI.
 */
export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const fallback = this.props.fallback;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[280px] px-4 text-center">
          <p className="text-gray-600 font-medium">Something went wrong loading this page.</p>
          <p className="text-sm text-gray-500 mt-1">Try refreshing or go back to the dashboard.</p>
          <Link
            to="/counsellor/dashboard"
            className="mt-4 rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-white hover:bg-primary-navy/90"
          >
            Go to Dashboard
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

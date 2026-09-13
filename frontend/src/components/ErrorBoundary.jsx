import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.handleReset)
          : this.props.fallback;
      }

      return (
        <div className="p-6 my-4 mx-auto max-w-2xl bg-white border border-rose-200 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-navy-950 mb-1">
            {this.props.title || 'Route View Temporarily Unavailable'}
          </h3>
          <p className="text-xs text-navy-600 mb-4 max-w-md mx-auto leading-relaxed">
            {this.props.message ||
              'A temporary error occurred while rendering the route geometry or bus schedule. Your session and tickets are safe.'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Corridor View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

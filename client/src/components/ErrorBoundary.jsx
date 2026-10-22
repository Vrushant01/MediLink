import React from 'react';
import Button from './Button';
import { AlertCircle } from 'lucide-react';

// Calm fallback boundary preventing unhandled runtime exceptions from breaking the entire page
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Suppress unhandled exceptions quietly
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-10 h-10 rounded-full bg-status-expired-bg border border-[#F5C2BC] flex items-center justify-center text-status-expired mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-serif text-ink mb-1.5 font-normal">
            Something went wrong on this page
          </h2>
          <p className="text-xs text-ink-soft mb-5">
            An unexpected error occurred while displaying this section. Your data is safe.
          </p>
          <Button variant="primary" size="sm" onClick={this.handleReload}>
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

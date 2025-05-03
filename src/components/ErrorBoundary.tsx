import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastError: Date | null;
  recoveryAttempted: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastError: null,
      recoveryAttempted: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error,
      errorCount: 1, // We'll increment in componentDidCatch instead
      lastError: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const componentName = this.props.componentName || 'unknown component';
    
    // Enhanced error logging with timestamp and component info
    console.error(
      `[ErrorBoundary] Error caught at ${new Date().toISOString()} in ${componentName}:`, 
      error
    );
    console.error(`[ErrorBoundary] Component stack for ${componentName}:`, errorInfo.componentStack);
    
    // Log additional context that might help debugging
    console.error(`[ErrorBoundary] Error details for ${componentName}:`, {
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      previousErrorCount: this.state.errorCount,
      recoveryAttempted: this.state.recoveryAttempted,
      lastError: this.state.lastError
    });
    
    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
      lastError: new Date()
    });
  }
  
  // Try to recover from error state after timeout
  componentDidUpdate(prevProps: Props, prevState: State): void {
    // If we just entered an error state and haven't tried recovery yet
    if (this.state.hasError && !prevState.hasError && !this.state.recoveryAttempted) {
      // Only try recovery if this is the first error
      if (this.state.errorCount === 1) {
        console.log(`[ErrorBoundary] Attempting auto-recovery for ${this.props.componentName || 'unknown component'} in 2 seconds`);
        
        setTimeout(() => {
          console.log(`[ErrorBoundary] Executing auto-recovery for ${this.props.componentName || 'unknown component'}`);
          this.setState({ 
            hasError: false, 
            recoveryAttempted: true 
          });
        }, 2000);
      } else {
        console.log(`[ErrorBoundary] Skipping auto-recovery for ${this.props.componentName || 'unknown component'} due to multiple errors (${this.state.errorCount})`);
      }
    }
  }
  
  // Allow manual retry
  handleRetry = (): void => {
    console.log(`[ErrorBoundary] Manual retry requested for ${this.props.componentName || 'unknown component'}`);
    
    // Track performance of recovery
    const startTime = performance.now();
    
    this.setState({ 
      hasError: false,
      recoveryAttempted: true
    }, () => {
      const endTime = performance.now();
      console.log(`[ErrorBoundary] Manual retry completed for ${this.props.componentName || 'unknown component'} in ${(endTime - startTime).toFixed(2)}ms`);
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise show default error UI
      return this.props.fallback || (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Something went wrong{this.props.componentName ? ` in ${this.props.componentName}` : ''}.
          </h2>
          
          <div className="mb-4">
            <button
              onClick={this.handleRetry}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 mb-3"
            >
              Retry
            </button>
            
            <p className="text-sm text-gray-700">
              This section encountered an error. You can try again or reload the page.
            </p>
          </div>
          
          <details className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
            <summary className="cursor-pointer mb-1 text-red-600 font-medium">Error Details (for developers)</summary>
            <div className="mb-2 mt-2">
              <h3 className="font-medium mb-1">Error Message:</h3>
              <p className="font-mono text-xs overflow-auto p-2 bg-gray-50">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
            
            <div className="mb-2">
              <h3 className="font-medium mb-1">Component Stack:</h3>
              <pre className="text-xs overflow-auto p-2 bg-gray-50 max-h-64">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
            
            <div className="mb-2">
              <h3 className="font-medium mb-1">Error Count:</h3>
              <p className="text-xs p-2 bg-gray-50">
                This error has occurred {this.state.errorCount} time(s).
                {this.state.lastError && ` Last occurrence: ${this.state.lastError.toLocaleTimeString()}`}
              </p>
            </div>
            
            <div className="text-xs mt-4 pt-2 border-t border-gray-200">
              <p>If this error persists, please try refreshing the page.</p>
            </div>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

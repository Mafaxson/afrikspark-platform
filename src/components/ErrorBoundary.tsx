import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // You can log errors to an external service here
    // console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl rounded-xl border border-border bg-card p-10 text-center shadow">
            <h1 className="text-2xl font-semibold mb-4">Something went wrong.</h1>
            <p className="text-sm text-muted-foreground mb-4">
              The application encountered an error while rendering. Please try refreshing the page.
            </p>
            <pre className="text-xs text-left overflow-auto max-h-48 bg-muted p-3 rounded">
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

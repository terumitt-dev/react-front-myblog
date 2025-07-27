// app/src/components/utils/ErrorBoundary.tsx
import { Component, ReactNode } from "react";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

type FallbackType = ReactNode | ((props: FallbackProps) => ReactNode);

interface Props {
  children: ReactNode;
  fallback?: FallbackType;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };

    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", info);
  }

  resetError() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error } = this.state;

      if (typeof fallback === "function") {
        // 関数型fallback
        return fallback({
          error: error || new Error("Unknown error"),
          resetErrorBoundary: this.resetError,
        });
      }

      // ReactNode型fallback
      return (
        fallback ?? (
          <div style={{ padding: "2rem", color: "red" }}>
            <h2>予期せぬエラーが発生しました。</h2>
            <p>ページを再読み込みするか、しばらくしてからお試しください。</p>
            <button
              type="button"
              style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
              onClick={this.resetError}
            >
              やり直す
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

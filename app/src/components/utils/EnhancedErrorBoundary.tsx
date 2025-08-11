// app/src/components/utils/EnhancedErrorBoundary.tsx
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReloadButton?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // 開発環境でのデバッグ情報
    if (import.meta.env.DEV) {
      console.group("🔍 Error Details");
      console.error("Error:", error);
      console.error("Component Stack:", errorInfo.componentStack);
      console.error("Error Boundary Props:", this.props);
      console.groupEnd();
    }

    // エラー情報を状態に保存
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // 状態をリセットしてリロード
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleReset = () => {
    // エラー状態のみリセット
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 p-6"
          role="alert"
        >
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-xl font-bold text-red-600 mb-4">
              予期しないエラーが発生しました
            </h2>
            <p className="text-gray-700 mb-6">
              申し訳ございません。アプリケーションでエラーが発生しました。
            </p>

            {/* 開発環境でのエラー詳細 */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left bg-gray-100 p-4 rounded text-sm">
                <summary className="cursor-pointer font-semibold text-red-600 mb-2">
                  🔧 開発者情報
                </summary>
                <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                  <strong>Error:</strong> {this.state.error.message}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <br />
                      <br />
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={this.handleReset}
                aria-label="エラーをリセットして続行"
              >
                ✨ 再試行
              </button>

              {this.props.showReloadButton !== false && (
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  onClick={this.handleReload}
                  aria-label="ページを再読み込み"
                >
                  🔄 再読み込み
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              問題が続く場合は、ブラウザのキャッシュをクリアしてください
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;

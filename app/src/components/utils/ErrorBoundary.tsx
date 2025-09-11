// app/src/components/utils/ErrorBoundary.tsx
import { ErrorBoundary } from "react-error-boundary";
import type { ReactNode } from "react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900">
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          エラーが発生しました
        </h1>

        {/* デバッグモードでのみエラー詳細を表示 */}
        {import.meta.env.DEV && (
          <details className="mb-4">
            <summary className="cursor-pointer text-gray-700 dark:text-gray-300 font-semibold">
              エラー詳細を表示（開発環境のみ）
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto text-gray-800 dark:text-gray-200">
              <strong>Error:</strong> {error.message}
              {error.stack && (
                <>
                  <br />
                  <strong>Stack:</strong>
                  <br />
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            ページを再読み込み
          </button>

          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            再試行
          </button>
        </div>

        {/* 本番環境では簡潔なメッセージのみ */}
        {!import.meta.env.DEV && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            問題が継続する場合は、ページを再読み込みしてください。
          </p>
        )}
      </div>
    </div>
  );
};

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const AppErrorBoundary = ({
  children,
  fallback: FallbackComponent = ErrorFallback,
  onError,
}: Props) => {
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, errorInfo) => {
        // 開発環境でのみコンソールログ
        if (import.meta.env.DEV) {
          console.error("🚨 ErrorBoundary caught an error:", error);
          console.error("Component stack:", errorInfo.componentStack);
        }

        // カスタムエラーハンドラーがあれば実行
        onError?.(error, errorInfo);
      }}
      onReset={() => {
        // 必要に応じてアプリケーション状態をリセット
        if (import.meta.env.DEV) {
          console.log("🔄 ErrorBoundary reset");
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// 後方互換性のためのエイリアス
export const DebugErrorBoundary = AppErrorBoundary;

// app/src/components/utils/ResettableErrorBoundary.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

// デフォルトのフォールバックコンポーネント
const defaultFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error.message}</p>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          再試行
        </button>
      </div>
    </div>
  </div>
);

export function ResettableErrorBoundary({
  children,
  fallback = defaultFallback,
  onError,
  onReset,
}: {
  children: ReactNode;
  fallback?: (props: FallbackProps) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}) {
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setKey((prev) => prev + 1);
    onReset?.();
    console.log("🔄 ResettableErrorBoundary: コンポーネントをリセットしました");
  };

  return (
    <ErrorBoundary
      key={key}
      fallbackRender={fallback}
      onError={(error, errorInfo) => {
        console.error(
          "🚨 ResettableErrorBoundary caught an error:",
          error,
          errorInfo,
        );
        onError?.(error, errorInfo);
      }}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
}

// 使いやすさのためのエクスポート
export { ResettableErrorBoundary as default };

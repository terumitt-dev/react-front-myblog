// app/src/components/utils/ResettableErrorBoundary.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import { AppErrorBoundary } from "./ErrorBoundary";

export function ResettableErrorBoundary({
  children,
  onError,
  onReset,
}: {
  children: ReactNode;
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
    <AppErrorBoundary
      key={key}
      onError={(error, errorInfo) => {
        console.error(
          "🚨 ResettableErrorBoundary caught an error:",
          error,
          errorInfo,
        );
        onError?.(error, errorInfo);
      }}
      onReset={handleReset} // AppErrorBoundaryのonResetに渡す
    >
      {children}
    </AppErrorBoundary>
  );
}

// 使いやすさのためのエクスポート
export { ResettableErrorBoundary as default };

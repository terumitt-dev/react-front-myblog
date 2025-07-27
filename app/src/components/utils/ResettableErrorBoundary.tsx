// app/src/components/utils/ResettableErrorBoundary.tsx
import { useState } from "react";
import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";

type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

type FallbackType =
  | React.ReactNode
  | ((props: FallbackProps) => React.ReactNode);

export function ResettableErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: FallbackType;
}) {
  const [key, setKey] = useState(0);

  const handleReset = () => setKey((prev) => prev + 1);

  return (
    <ErrorBoundary
      key={key}
      fallback={
        typeof fallback === "function"
          ? (props: FallbackProps) => {
              // 重複呼び出しを避けるため、ラップした関数を作成
              const combinedReset = () => {
                handleReset();
                props.resetErrorBoundary();
              };

              return fallback({
                ...props,
                resetErrorBoundary: combinedReset,
              });
            }
          : fallback
      }
    >
      {children}
    </ErrorBoundary>
  );
}

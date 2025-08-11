// app/src/components/utils/errorHandler.ts
export class BlogError extends Error {
  public code: string;
  public severity: "low" | "medium" | "high";

  constructor(
    message: string,
    code: string,
    severity: "low" | "medium" | "high" = "medium",
  ) {
    super(message);
    this.name = "BlogError";
    this.code = code;
    this.severity = severity;
  }
}

export const handleStorageError = (error: unknown, operation: string): void => {
  console.error(`Storage ${operation} failed:`, error);

  // クリティカルエラーの場合は通知
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    console.warn("⚠️ ストレージ容量が不足しています");
    // TODO: ユーザーに通知する仕組みを追加
  }
};

// 型安全な関数ラッパー
export const withErrorBoundary = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  fallback?: (...args: TArgs) => TReturn,
): ((...args: TArgs) => TReturn) => {
  return (...args: TArgs): TReturn => {
    try {
      return fn(...args);
    } catch (error) {
      console.error("Function execution failed:", error);
      if (fallback) {
        return fallback(...args);
      }
      throw error;
    }
  };
};

export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn("JSON parse failed, using fallback:", error);
    return fallback;
  }
};

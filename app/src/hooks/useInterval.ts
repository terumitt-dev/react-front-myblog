// app/src/hooks/useInterval.ts
import { useRef, useEffect, useCallback } from "react";

export function useInterval(
  callback: () => void,
  delay: number | null,
  deps: readonly (string | number | boolean | null | undefined)[] = [],
) {
  const savedCallback = useRef<() => void>();
  const intervalRef = useRef<number | null>(null);

  // 最新のコールバックを保存
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 安全なクリアアップ関数
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // インターバルの管理
  useEffect(() => {
    clearCurrentInterval();

    if (delay === null) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);

    return clearCurrentInterval;
  }, [delay, clearCurrentInterval, ...deps]);

  // コンポーネントアンマウント時の強制クリーンアップ
  useEffect(() => {
    return clearCurrentInterval;
  }, [clearCurrentInterval]);
}

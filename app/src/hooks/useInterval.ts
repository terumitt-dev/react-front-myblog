// app/src/hooks/useInterval.ts
import { useRef, useEffect, useMemo } from "react";
import { useTimers } from "./useTimers";

/**
 * 依存配列の深い比較を行うヘルパー関数
 */
const deepCompare = (a: readonly unknown[], b: readonly unknown[]): boolean => {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    const aVal = a[i];
    const bVal = b[i];

    // プリミティブ値の比較
    if (aVal === bVal) continue;

    // null/undefinedの処理
    if (aVal == null || bVal == null) return false;

    // オブジェクト/配列の場合は文字列化して比較（パフォーマンス考慮）
    if (typeof aVal === "object" || typeof bVal === "object") {
      try {
        if (JSON.stringify(aVal) !== JSON.stringify(bVal)) return false;
      } catch {
        // JSON.stringifyが失敗した場合は異なるとみなす
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
};

/**
 * 指定した間隔で関数を実行するカスタムフック
 * delay=nullの場合は実行を停止
 * @param callback 実行する関数
 * @param delay 間隔（ミリ秒）またはnull
 * @param deps 依存配列
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  deps: readonly unknown[] = [],
) {
  const { setInterval, clearInterval } = useTimers();
  const savedCallback = useRef<() => void>();
  const intervalRef = useRef<number | null>(null);
  const depsRef = useRef<readonly unknown[]>([]);

  // 最新のコールバックを保存
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 依存配列の変化を正確に検出
  const depsChanged = useMemo(() => {
    const changed = !deepCompare(depsRef.current, deps);
    if (changed) {
      depsRef.current = deps;
    }
    return changed;
  }, [deps]);

  // インターバルの管理
  useEffect(() => {
    if (delay === null) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      savedCallback.current?.();
    }, delay);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [delay, setInterval, clearInterval, depsChanged]);
}

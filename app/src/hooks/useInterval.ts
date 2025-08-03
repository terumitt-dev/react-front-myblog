// app/src/hooks/useInterval.ts
import { useRef, useEffect } from "react";
import { useTimers } from "./useTimers";

/**
 * 軽量な浅い比較（プリミティブ値のみ対応）
 */
const shallowCompare = (
  a: readonly unknown[],
  b: readonly unknown[],
): boolean => {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
};

/**
 * 指定した間隔で関数を実行するカスタムフック
 * delay=nullの場合は実行を停止
 * @param callback 実行する関数
 * @param delay 間隔（ミリ秒）またはnull
 * @param deps 依存配列（プリミティブ値のみ）
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  deps: readonly (string | number | boolean | null | undefined)[] = [],
) {
  const { setInterval, clearInterval } = useTimers();
  const savedCallback = useRef<() => void>();
  const intervalRef = useRef<number | null>(null);
  const depsRef = useRef<
    readonly (string | number | boolean | null | undefined)[]
  >([]);

  // 最新のコールバックを保存
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 依存配列の変化チェック（軽量版）
  const depsChanged = !shallowCompare(depsRef.current, deps);
  if (depsChanged) {
    depsRef.current = deps;
  }

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

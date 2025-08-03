// app/src/hooks/useInterval.ts
import { useRef, useEffect } from "react";
import { useTimers } from "./useTimers";

/**
 * 指定した間隔で関数を実行するカスタムフック
 * delay=nullの場合は実行を停止
 * @param callback 実行する関数
 * @param delay 間隔（ミリ秒）またはnull
 * @param deps 依存配列（プリミティブ値のみ推奨）
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  deps: readonly (string | number | boolean | null | undefined)[] = [],
) {
  const { setInterval, clearInterval } = useTimers();
  const savedCallback = useRef<() => void>();
  const intervalRef = useRef<number | null>(null);

  // 最新のコールバックを保存
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // インターバルの管理（依存配列をそのまま使用）
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
  }, [delay, setInterval, clearInterval, ...deps]); // シンプルに戻す
}

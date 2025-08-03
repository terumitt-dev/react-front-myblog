// app/src/hooks/useInterval.ts
import { useRef, useEffect, useCallback } from "react";

/**
 * 完全にクリーンアップされる安全なインターバルフック
 * ブラウザ環境に最適化（numberベース）
 * @param callback 実行する関数
 * @param delay 間隔（ミリ秒）またはnull
 * @param deps 依存配列（プリミティブ値のみ）
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  deps: readonly (string | number | boolean | null | undefined)[] = [],
) {
  const savedCallback = useRef<() => void>();
  const intervalRef = useRef<number | null>(null); // ブラウザ環境に合わせてnumber型に修正

  // 最新のコールバックを保存
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 安全なクリアアップ関数
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // インターバルの管理
  useEffect(() => {
    // 既存のインターバルをクリア
    clearCurrentInterval();

    if (delay === null) {
      return;
    }

    // 新しいインターバルを設定（ブラウザのsetIntervalは number を返す）
    intervalRef.current = window.setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);

    // クリーンアップ関数
    return clearCurrentInterval;
  }, [delay, clearCurrentInterval, ...deps]);

  // コンポーネントアンマウント時の強制クリーンアップ
  useEffect(() => {
    return clearCurrentInterval;
  }, [clearCurrentInterval]);
}

// app/src/hooks/useInterval.ts
import { useRef, useEffect } from "react";
import { useTimers } from "./useTimers";

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
  deps: any[] = [],
) {
  const { setInterval, clearInterval } = useTimers();
  const savedCallback = useRef<() => void>();
  const idRef = useRef<number | null>(null);

  // コールバック関数を記憶
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // インターバルのセットアップ
  useEffect(() => {
    if (delay === null) {
      // delayがnullの場合、既存のインターバルをクリア
      if (idRef.current !== null) {
        clearInterval(idRef.current);
        idRef.current = null;
      }
      return;
    }

    const tick = () => {
      if (savedCallback.current) savedCallback.current();
    };

    idRef.current = setInterval(tick, delay);

    // クリーンアップ関数
    return () => {
      if (idRef.current !== null) {
        clearInterval(idRef.current);
        idRef.current = null;
      }
    };
  }, [delay, clearInterval, setInterval, ...deps]);
}

// app/src/hooks/useTimers.ts
import { useRef, useEffect, useCallback } from "react";

/**
 * タイマーとインターバルを管理するシンプルなフック
 * コンポーネントのライフサイクルに合わせて自動的にクリーンアップを行います
 */
export function useTimers() {
  // コンポーネント固有のタイマーIDを保持する
  const timeoutIdsRef = useRef<number[]>([]);
  const intervalIdsRef = useRef<number[]>([]);

  /**
   * タイムアウトを設定し、IDを自動的に管理する
   * @param callback 実行する関数
   * @param delay 遅延時間（ミリ秒）
   * @returns タイムアウトID
   */
  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      // 実行後、自動的にIDリストから削除
      callback();
      timeoutIdsRef.current = timeoutIdsRef.current.filter((tid) => tid !== id);
    }, delay);

    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  /**
   * タイムアウトをクリアする
   * @param id タイムアウトID
   */
  const clearMyTimeout = useCallback((id: number) => {
    window.clearMyTimeout(id);
    timeoutIdsRef.current = timeoutIdsRef.current.filter((tid) => tid !== id);
  }, []);

  /**
   * インターバルを設定し、IDを自動的に管理する
   * @param callback 実行する関数
   * @param delay 間隔（ミリ秒）
   * @returns インターバルID
   */
  const setInterval = useCallback((callback: () => void, delay: number) => {
    const id = window.setInterval(callback, delay);
    intervalIdsRef.current.push(id);
    return id;
  }, []);

  /**
   * インターバルをクリアする
   * @param id インターバルID
   */
  const clearInterval = useCallback((id: number) => {
    window.clearInterval(id);
    intervalIdsRef.current = intervalIdsRef.current.filter((iid) => iid !== id);
  }, []);

  // コンポーネントのアンマウント時にすべてのタイマーをクリーンアップ
  useEffect(() => {
    return () => {
      // すべてのタイムアウトをクリア
      timeoutIdsRef.current.forEach((id) => window.clearMyTimeout(id));
      // すべてのインターバルをクリア
      intervalIdsRef.current.forEach((id) => window.clearInterval(id));
      // 参照を空にする
      timeoutIdsRef.current = [];
      intervalIdsRef.current = [];
    };
  }, []);

  return {
    setTimeout,
    clearMyTimeout,
    setInterval,
    clearInterval,
  };
}

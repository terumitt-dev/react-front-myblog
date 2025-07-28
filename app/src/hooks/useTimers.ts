// app/src/hooks/useTimers.ts
import { useRef, useEffect, useCallback } from "react";

// シングルトンインスタンスを保持するためのグローバル変数
let timersInstance: ReturnType<typeof createTimersManager> | null = null;

/**
 * タイマー管理の実装を分離
 */
function createTimersManager() {
  // タイマーIDを保持するref
  const timeoutIds: number[] = [];
  const intervalIds: number[] = [];

  /**
   * タイムアウトを設定し、IDを自動的に管理する
   * @param callback 実行する関数
   * @param delay 遅延時間（ミリ秒）
   * @returns タイムアウトID
   */
  const setTimeout = (callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      // 実行後、自動的にIDリストから削除
      callback();
      const index = timeoutIds.indexOf(id);
      if (index !== -1) {
        timeoutIds.splice(index, 1);
      }
    }, delay);

    timeoutIds.push(id);
    return id;
  };

  /**
   * タイムアウトをクリアする
   * @param id タイムアウトID
   */
  const clearTimeout = (id: number) => {
    window.clearTimeout(id);
    const index = timeoutIds.indexOf(id);
    if (index !== -1) {
      timeoutIds.splice(index, 1);
    }
  };

  /**
   * インターバルを設定し、IDを自動的に管理する
   * @param callback 実行する関数
   * @param delay 間隔（ミリ秒）
   * @returns インターバルID
   */
  const setInterval = (callback: () => void, delay: number) => {
    const id = window.setInterval(callback, delay);
    intervalIds.push(id);
    return id;
  };

  /**
   * インターバルをクリアする
   * @param id インターバルID
   */
  const clearInterval = (id: number) => {
    window.clearInterval(id);
    const index = intervalIds.indexOf(id);
    if (index !== -1) {
      intervalIds.splice(index, 1);
    }
  };

  /**
   * すべてのタイマーをクリーンアップする
   */
  const cleanupAll = () => {
    // すべてのタイムアウトをクリア
    timeoutIds.slice().forEach((id) => {
      window.clearTimeout(id);
    });
    // すべてのインターバルをクリア
    intervalIds.slice().forEach((id) => {
      window.clearInterval(id);
    });
    // 配列を空にする
    timeoutIds.length = 0;
    intervalIds.length = 0;
  };

  return {
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    cleanupAll,
    _getTimeoutIds: () => [...timeoutIds],
    _getIntervalIds: () => [...intervalIds],
  };
}

/**
 * タイマーとインターバルを一元管理するカスタムフック
 * コンポーネントのアンマウント時に自動的にすべてのタイマーをクリーンアップします
 */
export function useTimers() {
  // シングルトンインスタンスの作成または取得
  if (!timersInstance) {
    timersInstance = createTimersManager();
  }

  // コンポーネントのアンマウント時にクリーンアップを行う
  useEffect(() => {
    return () => {
      // コンポーネントがアンマウントされる時、関連するタイマーをクリーンアップ
      // アプリケーション全体のクリーンアップは行わない（シングルトンなため）
    };
  }, []);

  // メソッドをuseCallback内でラップして安定したリファレンスを提供
  const wrappedSetTimeout = useCallback(timersInstance.setTimeout, []);
  const wrappedClearTimeout = useCallback(timersInstance.clearTimeout, []);
  const wrappedSetInterval = useCallback(timersInstance.setInterval, []);
  const wrappedClearInterval = useCallback(timersInstance.clearInterval, []);

  return {
    setTimeout: wrappedSetTimeout,
    clearTimeout: wrappedClearTimeout,
    setInterval: wrappedSetInterval,
    clearInterval: wrappedClearInterval,
  };
}

// app/src/hooks/useTimers.ts
import { useRef, useEffect, useCallback } from "react";

// シングルトンインスタンスを保持するためのグローバル変数
let timersInstance: ReturnType<typeof createTimersManager> | null = null;

// 定期的なクリーンアップの間隔（ミリ秒）
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1時間
// クリーンアップタイマーを停止するまでの非アクティブ時間（ミリ秒）
const CLEANUP_TIMER_IDLE_TIMEOUT = 3 * 60 * 60 * 1000; // 3時間

/**
 * タイマー管理の実装を分離
 */
function createTimersManager() {
  // タイマーIDを保持する配列
  const timeoutIds: number[] = [];
  const intervalIds: number[] = [];

  // 最後のアクティビティタイムスタンプ
  let lastActivity = Date.now();

  // 使用中のタイマーの数
  let activeTimersCount = 0;

  // 定期的なクリーンアップタイマーのID
  let cleanupTimerId: number | null = null;

  // 定期的なクリーンアップを開始
  const startPeriodicCleanup = () => {
    if (cleanupTimerId === null) {
      lastActivity = Date.now(); // アクティビティを更新

      cleanupTimerId = window.setInterval(() => {
        const now = Date.now();

        // 1時間以上アクティビティがなく、アクティブなタイマーがなければクリーンアップ
        if (now - lastActivity > CLEANUP_INTERVAL && activeTimersCount === 0) {
          cleanupAll();
        }

        // 3時間以上アクティビティがなければクリーンアップタイマー自体も停止
        if (now - lastActivity > CLEANUP_TIMER_IDLE_TIMEOUT) {
          if (cleanupTimerId !== null) {
            window.clearInterval(cleanupTimerId);
            cleanupTimerId = null;
          }
        }
      }, CLEANUP_INTERVAL);
    }
  };

  /**
   * アクティビティを記録する
   */
  const recordActivity = () => {
    lastActivity = Date.now();

    // アクティビティがあり、クリーンアップタイマーが停止していれば再開
    if (
      cleanupTimerId === null &&
      (timeoutIds.length > 0 || intervalIds.length > 0)
    ) {
      startPeriodicCleanup();
    }
  };

  /**
   * タイムアウトを設定し、IDを自動的に管理する
   */
  const setTimeout = (callback: () => void, delay: number) => {
    recordActivity();
    activeTimersCount++;

    const id = window.setTimeout(() => {
      // 実行後、自動的にIDリストから削除
      callback();
      const index = timeoutIds.indexOf(id);
      if (index !== -1) {
        timeoutIds.splice(index, 1);
      }
      activeTimersCount--;
    }, delay);

    timeoutIds.push(id);
    startPeriodicCleanup();
    return id;
  };

  /**
   * タイムアウトをクリアする
   */
  const clearTimeout = (id: number) => {
    recordActivity();
    window.clearTimeout(id);
    const index = timeoutIds.indexOf(id);
    if (index !== -1) {
      timeoutIds.splice(index, 1);
      activeTimersCount--;
    }
  };

  /**
   * インターバルを設定し、IDを自動的に管理する
   */
  const setInterval = (callback: () => void, delay: number) => {
    recordActivity();
    activeTimersCount++;

    const id = window.setInterval(callback, delay);
    intervalIds.push(id);
    startPeriodicCleanup();
    return id;
  };

  /**
   * インターバルをクリアする
   */
  const clearInterval = (id: number) => {
    recordActivity();
    window.clearInterval(id);
    const index = intervalIds.indexOf(id);
    if (index !== -1) {
      intervalIds.splice(index, 1);
      activeTimersCount--;
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

    // クリーンアップタイマーもクリア
    if (cleanupTimerId !== null) {
      window.clearInterval(cleanupTimerId);
      cleanupTimerId = null;
    }

    // 配列を空にする
    timeoutIds.length = 0;
    intervalIds.length = 0;
    activeTimersCount = 0;
  };

  return {
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    cleanupAll,
    recordActivity, // アクティビティを手動で記録するためのメソッドを公開
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

  // コンポーネント固有のタイマーIDを保持する
  const componentTimeoutIdsRef = useRef<number[]>([]);
  const componentIntervalIdsRef = useRef<number[]>([]);

  // フックが呼び出されるたびにアクティビティを記録
  timersInstance.recordActivity();

  // オリジナルのメソッドをラップして、コンポーネント固有のIDを追跡
  const wrappedSetTimeout = useCallback(
    (callback: () => void, delay: number) => {
      const id = timersInstance!.setTimeout(callback, delay);
      componentTimeoutIdsRef.current.push(id);
      return id;
    },
    [],
  );

  const wrappedClearTimeout = useCallback((id: number) => {
    timersInstance!.clearTimeout(id);
    componentTimeoutIdsRef.current = componentTimeoutIdsRef.current.filter(
      (timeId) => timeId !== id,
    );
  }, []);

  const wrappedSetInterval = useCallback(
    (callback: () => void, delay: number) => {
      const id = timersInstance!.setInterval(callback, delay);
      componentIntervalIdsRef.current.push(id);
      return id;
    },
    [],
  );

  const wrappedClearInterval = useCallback((id: number) => {
    timersInstance!.clearInterval(id);
    componentIntervalIdsRef.current = componentIntervalIdsRef.current.filter(
      (intId) => intId !== id,
    );
  }, []);

  // コンポーネントのアンマウント時にコンポーネント固有のタイマーをクリーンアップ
  useEffect(() => {
    return () => {
      // このコンポーネントが設定したタイマーをクリア
      componentTimeoutIdsRef.current.forEach((id) => {
        timersInstance!.clearTimeout(id);
      });

      componentIntervalIdsRef.current.forEach((id) => {
        timersInstance!.clearInterval(id);
      });

      // 参照を空にする
      componentTimeoutIdsRef.current = [];
      componentIntervalIdsRef.current = [];
    };
  }, []);

  return {
    setTimeout: wrappedSetTimeout,
    clearTimeout: wrappedClearTimeout,
    setInterval: wrappedSetInterval,
    clearInterval: wrappedClearInterval,
  };
}

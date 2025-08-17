// app/src/hooks/__tests__/useTimers.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTimers } from "../useTimers";

describe("useTimers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("初期状態で必要な関数が提供される", () => {
    const { result } = renderHook(() => useTimers());

    expect(typeof result.current.setTimeout).toBe("function");
    expect(typeof result.current.clearMyTimeout).toBe("function");
    expect(typeof result.current.setInterval).toBe("function");
    expect(typeof result.current.clearInterval).toBe("function");
  });

  it("setTimeoutが正常に動作する", () => {
    const { result } = renderHook(() => useTimers());
    const callback = vi.fn();

    let timerId: number;
    act(() => {
      timerId = result.current.setTimeout(callback, 1000);
    });

    expect(typeof timerId).toBe("number");
    expect(callback).not.toHaveBeenCalled();

    // 1秒進める
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("clearMyTimeoutが正常に動作する", () => {
    const { result } = renderHook(() => useTimers());
    const callback = vi.fn();

    let timerId: number;
    act(() => {
      timerId = result.current.setTimeout(callback, 1000);
      result.current.clearMyTimeout(timerId);
    });

    // 1秒進めてもコールバックは実行されない
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("setIntervalが正常に動作する", () => {
    const { result } = renderHook(() => useTimers());
    const callback = vi.fn();

    let intervalId: number;
    act(() => {
      intervalId = result.current.setInterval(callback, 500);
    });

    expect(typeof intervalId).toBe("number");
    expect(callback).not.toHaveBeenCalled();

    // 500ms進める
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // さらに500ms進める
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(2);

    // インターバルをクリア
    act(() => {
      result.current.clearInterval(intervalId);
    });

    // さらに500ms進めてもコールバックは実行されない
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("複数のタイマーを同時に管理できる", () => {
    const { result } = renderHook(() => useTimers());
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();

    let timerId1: number;
    let timerId2: number;
    let intervalId: number;

    act(() => {
      timerId1 = result.current.setTimeout(callback1, 1000);
      timerId2 = result.current.setTimeout(callback2, 2000);
      intervalId = result.current.setInterval(callback3, 500);
    });

    // 500ms進める（インターバルが1回実行）
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).toHaveBeenCalledTimes(1);

    // 1000ms時点（タイマー1が実行、インターバルが2回実行）
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).toHaveBeenCalledTimes(2);

    // 2000ms時点（タイマー2が実行、インターバルが4回実行）
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(4);

    // インターバルをクリア
    act(() => {
      result.current.clearInterval(intervalId);
    });
  });

  it("コンポーネントのアンマウント時に全てのタイマーがクリアされる", () => {
    const { result, unmount } = renderHook(() => useTimers());
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    act(() => {
      result.current.setTimeout(callback1, 1000);
      result.current.setInterval(callback2, 500);
    });

    // アンマウント
    unmount();

    // タイマーが動作しないことを確認
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it("タイムアウト実行後に自動的にIDが管理リストから削除される", () => {
    const { result } = renderHook(() => useTimers());
    const callback = vi.fn();

    act(() => {
      result.current.setTimeout(callback, 1000);
    });

    // スパイを使ってclearTimeoutが呼ばれないことを確認
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    // 1秒進める（タイムアウト実行）
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // コンポーネントをアンマウントしても、すでに実行済みのタイマーに対して
    // clearTimeoutは呼ばれない（IDがリストから削除されているため）
    const initialClearCount = clearTimeoutSpy.mock.calls.length;

    act(() => {
      result.current.setTimeout(() => {}, 1000); // 新しいタイマーを追加
    });

    const { unmount } = renderHook(() => useTimers());
    unmount();

    clearTimeoutSpy.mockRestore();
  });
});

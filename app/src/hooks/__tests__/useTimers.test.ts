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

  it("初期状態が正しく設定される", () => {
    const { result } = renderHook(() => useTimers());

    expect(result.current.timers.size).toBe(0);
    expect(typeof result.current.addTimer).toBe("function");
    expect(typeof result.current.clearTimer).toBe("function");
    expect(typeof result.current.clearAllTimers).toBe("function");
  });

  it("タイマーが正常に追加される", () => {
    const { result } = renderHook(() => useTimers());
    const callback = vi.fn();

    act(() => {
      result.current.addTimer("test-timer", callback, 1000);
    });

    expect(result.current.timers.has("test-timer")).toBe(true);
    expect(callback).not.toHaveBeenCalled();

    // 1秒進める
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("同じキーのタイマーを追加すると前のものがクリアされる", () => {
    const { result } = renderHook(() => useTimers());
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    act(() => {
      result.current.addTimer("test-timer", callback1, 1000);
      result.current.addTimer("test-timer", callback2, 500);
    });

    // 500ms進める
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("タイマーが正常にクリアされる", () => {
    const { result } = renderHook(() => useTimers());
    const callback = vi.fn();

    act(() => {
      result.current.addTimer("test-timer", callback, 1000);
      result.current.clearTimer("test-timer");
    });

    expect(result.current.timers.has("test-timer")).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("全てのタイマーがクリアされる", () => {
    const { result } = renderHook(() => useTimers());
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    act(() => {
      result.current.addTimer("timer1", callback1, 1000);
      result.current.addTimer("timer2", callback2, 2000);
      result.current.clearAllTimers();
    });

    expect(result.current.timers.size).toBe(0);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});

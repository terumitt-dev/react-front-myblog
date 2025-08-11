// app/src/hooks/__tests__/useInterval.test.ts
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useInterval } from "../useInterval";

describe("useInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("指定した間隔でコールバックが実行される", () => {
    const callback = vi.fn();
    const delay = 1000;

    renderHook(() => useInterval(callback, delay));

    expect(callback).not.toHaveBeenCalled();

    // 1秒進める
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    // さらに1秒進める
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("delayがnullの場合はインターバルが設定されない", () => {
    const callback = vi.fn();

    renderHook(() => useInterval(callback, null));

    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("コンポーネントアンマウント時にインターバルがクリアされる", () => {
    const callback = vi.fn();
    const delay = 1000;

    const { unmount } = renderHook(() => useInterval(callback, delay));

    // インターバル設定確認
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    // アンマウント
    unmount();

    // アンマウント後はコールバックが実行されない
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("delayが変更された場合にインターバルが再設定される", () => {
    const callback = vi.fn();
    let delay = 1000;

    const { rerender } = renderHook(() => useInterval(callback, delay));

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    // delayを変更
    delay = 500;
    rerender();

    // 500msで実行されることを確認
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

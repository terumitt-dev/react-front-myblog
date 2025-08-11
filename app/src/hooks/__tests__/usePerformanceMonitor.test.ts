// app/src/hooks/__tests__/usePerformanceMonitor.test.ts
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { usePerformanceMonitor } from "../usePerformanceMonitor";

// Performance API モック
const mockPerformance = {
  now: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

Object.defineProperty(global, "performance", {
  value: mockPerformance,
});

describe("usePerformanceMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態が正しく設定される", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.renderTime).toBe(0);
    expect(result.current.isSlowRender).toBe(false);
    expect(typeof result.current.startTiming).toBe("function");
    expect(typeof result.current.endTiming).toBe("function");
  });

  it("タイミング計測が正常に動作する", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    // 開始時刻設定
    mockPerformance.now.mockReturnValue(1000);
    result.current.startTiming();

    // 終了時刻設定（100ms後）
    mockPerformance.now.mockReturnValue(1100);
    result.current.endTiming();

    expect(result.current.renderTime).toBe(100);
    expect(result.current.isSlowRender).toBe(false); // 100ms < 200ms
  });

  it("遅いレンダリングが検出される", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    // 開始時刻設定
    mockPerformance.now.mockReturnValue(1000);
    result.current.startTiming();

    // 終了時刻設定（300ms後）
    mockPerformance.now.mockReturnValue(1300);
    result.current.endTiming();

    expect(result.current.renderTime).toBe(300);
    expect(result.current.isSlowRender).toBe(true); // 300ms > 200ms
  });

  it("startTimingを呼ばずにendTimingを呼んだ場合", () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    mockPerformance.now.mockReturnValue(1100);
    result.current.endTiming();

    expect(result.current.renderTime).toBe(0);
    expect(result.current.isSlowRender).toBe(false);
  });

  it("Performance APIが利用できない場合", () => {
    // Performance APIを一時的に無効化
    const originalPerformance = global.performance;
    // @ts-ignore
    delete global.performance;

    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.renderTime).toBe(0);
    expect(result.current.isSlowRender).toBe(false);

    // Performance APIを復元
    global.performance = originalPerformance;
  });
});

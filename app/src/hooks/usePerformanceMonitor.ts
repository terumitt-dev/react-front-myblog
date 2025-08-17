// app/src/hooks/usePerformanceMonitor.ts
import { useState, useEffect, useRef } from "react";
import { PERFORMANCE_CONFIG } from "@/constants/appConfig";

interface PerformanceMetrics {
  isUnderStress: boolean;
  frameRate: number;
  memoryUsage?: number;
  renderTime: number;
  interactionLatency: number;
  isSlowRender: boolean;
  startTiming: () => void;
  endTiming: () => void;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

export const usePerformanceMonitor = (enabled = true): PerformanceMetrics => {
  const [metrics, setMetrics] = useState({
    isUnderStress: false,
    frameRate: 60,
    renderTime: 0,
    interactionLatency: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const measureFrameRate = () => {
      const now = performance.now();
      frameCountRef.current++;

      // 1秒ごとにフレームレートを計算
      if (
        now - lastTimeRef.current >=
        PERFORMANCE_CONFIG.FPS_CALCULATION_INTERVAL
      ) {
        const fps =
          (frameCountRef.current *
            PERFORMANCE_CONFIG.FPS_CALCULATION_INTERVAL) /
          (now - lastTimeRef.current);

        setMetrics((prev) => ({
          ...prev,
          frameRate: fps,
          isUnderStress: fps < 30, // 30fps以下でストレス状態と判定
        }));

        // 低FPS警告
        if (fps < 30) {
          console.warn("⚠️ 低FPS検出:", Math.round(fps));
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFrameRate);
    };

    rafIdRef.current = requestAnimationFrame(measureFrameRate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled]);

  // メモリ使用量監視（可能な場合）
  useEffect(() => {
    if (!enabled || typeof performance === "undefined") return;

    const extPerformance = performance as ExtendedPerformance;
    if (!extPerformance.memory) return;

    const updateMemoryUsage = () => {
      const memory = extPerformance.memory;
      if (memory) {
        const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;
        const memoryRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        setMetrics((prev) => ({
          ...prev,
          memoryUsage: memoryRatio,
        }));

        // メモリリーク警告
        if (memoryUsageMB > 100) {
          // 100MB
          console.warn("⚠️ 高メモリ使用量:", `${Math.round(memoryUsageMB)}MB`);
        }
      }
    };

    const interval = setInterval(
      updateMemoryUsage,
      PERFORMANCE_CONFIG.MEMORY_UPDATE_INTERVAL,
    );
    updateMemoryUsage(); // 初回実行

    return () => clearInterval(interval);
  }, [enabled]);

  // タイミング計測用関数
  const startTiming = () => {
    if (typeof performance !== "undefined") {
      startTimeRef.current = performance.now();
    }
  };

  const endTiming = () => {
    if (typeof performance !== "undefined" && startTimeRef.current !== null) {
      const now = performance.now();
      const renderTime = now - startTimeRef.current;
      setMetrics((prev) => ({
        ...prev,
        renderTime,
        isUnderStress: renderTime > PERFORMANCE_CONFIG.SLOW_RENDER_THRESHOLD,
      }));
      startTimeRef.current = null; // リセット
    }
  };

  return {
    ...metrics,
    isSlowRender: metrics.isUnderStress,
    startTiming,
    endTiming,
  };
};

// app/src/components/utils/PerformanceWrapper.tsx
import { memo, type ReactNode, useEffect, useRef } from "react";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

interface PerformanceWrapperProps {
  children: ReactNode;
  componentName?: string;
  enableMonitoring?: boolean;
}

const PerformanceWrapper = memo(
  ({
    children,
    componentName = "Unknown Component",
    enableMonitoring = typeof process !== "undefined" &&
      process.env.NODE_ENV === "development",
  }: PerformanceWrapperProps) => {
    const { startTiming, endTiming, renderTime, isSlowRender } =
      usePerformanceMonitor();

    // 最新値への参照を保持
    const renderTimeRef = useRef(renderTime);
    const isSlowRenderRef = useRef(isSlowRender);

    // 値を更新
    renderTimeRef.current = renderTime;
    isSlowRenderRef.current = isSlowRender;

    useEffect(() => {
      if (!enableMonitoring) return;

      startTiming();

      return () => {
        endTiming();

        if (isSlowRenderRef.current) {
          console.warn(
            `🐌 Slow render detected in ${componentName}: ${renderTimeRef.current}ms`,
          );
        } else if (
          typeof process !== "undefined" &&
          process.env.NODE_ENV === "development"
        ) {
          console.log(
            `⚡ ${componentName} rendered in ${renderTimeRef.current}ms`,
          );
        }
      };
    }, [enableMonitoring, componentName, startTiming, endTiming]);

    return <>{children}</>;
  },
);

PerformanceWrapper.displayName = "PerformanceWrapper";

export default PerformanceWrapper;

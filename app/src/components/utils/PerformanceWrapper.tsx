// app/src/components/utils/PerformanceWrapper.tsx
import { memo, ReactNode, useEffect } from "react";
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
    enableMonitoring = process.env.NODE_ENV === "development",
  }: PerformanceWrapperProps) => {
    const { startTiming, endTiming, renderTime, isSlowRender } =
      usePerformanceMonitor();

    useEffect(() => {
      if (!enableMonitoring) return;

      startTiming();

      return () => {
        endTiming();

        if (isSlowRender) {
          console.warn(
            `🐌 Slow render detected in ${componentName}: ${renderTime}ms`,
          );
        } else if (process.env.NODE_ENV === "development") {
          console.log(`⚡ ${componentName} rendered in ${renderTime}ms`);
        }
      };
    }, [
      enableMonitoring,
      componentName,
      startTiming,
      endTiming,
      renderTime,
      isSlowRender,
    ]);

    return <>{children}</>;
  },
);

PerformanceWrapper.displayName = "PerformanceWrapper";

export default PerformanceWrapper;

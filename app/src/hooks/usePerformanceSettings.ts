// app/src/hooks/usePerformanceSettings.ts
import { useState, useEffect, useMemo, useRef } from "react";

type PerformanceSettings = {
  readonly maxBubbles: number;
  readonly maxSpiders: number;
  readonly maxSnails: number;
  readonly bubbleInterval: number;
  readonly enableAnimations: boolean;
  readonly reducedAnimations: boolean;
  readonly enableEffects: boolean;
};

const createPerformanceSettings = (): ((
  width: number,
) => PerformanceSettings) => {
  const cores = navigator.hardwareConcurrency || 4;
  const userAgent = navigator.userAgent;
  const isMac =
    /Mac/i.test(userAgent) && !/(iPhone|iPad|iPod)/i.test(userAgent);

  return (width: number): PerformanceSettings => {
    const isMobile = width < 768;
    const isLowEnd = !isMac && (cores <= 2 || width < 768);
    const isHighEnd = isMac || (!isMobile && cores >= 8);

    if (isLowEnd) {
      return {
        maxBubbles: 2,
        maxSpiders: 3,
        maxSnails: 2,
        bubbleInterval: 6000,
        enableAnimations: true,
        reducedAnimations: true,
        enableEffects: true,
      };
    }

    if (isHighEnd) {
      return {
        maxBubbles: 8,
        maxSpiders: 8,
        maxSnails: 6,
        bubbleInterval: 2000,
        enableAnimations: true,
        reducedAnimations: false,
        enableEffects: true,
      };
    }

    return {
      maxBubbles: 4,
      maxSpiders: 4,
      maxSnails: 3,
      bubbleInterval: 3000,
      enableAnimations: true,
      reducedAnimations: false,
      enableEffects: true,
    };
  };
};

const getPerformanceSettings = createPerformanceSettings;

export const usePerformanceSettings = () => {
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const resizeTimeoutRef = useRef<number>();

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        setScreenWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const performanceSettings = useMemo(
    () => getPerformanceSettings(screenWidth),
    [screenWidth],
  );

  return { performanceSettings, screenWidth };
};

// app/src/hooks/useAccessibility.ts
import { useEffect, useState } from "react";

interface AccessibilityState {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  focusVisible: boolean;
}

export const useAccessibility = () => {
  const [a11yState, setA11yState] = useState<AccessibilityState>(() => ({
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    focusVisible: false,
  }));

  // Reduced Motion検出
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      console.log("♿ Reduced Motion:", e.matches);
      setA11yState((prev) => ({ ...prev, reducedMotion: e.matches }));
    };

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // High Contrast検出
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-contrast: high)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      console.log("🔆 High Contrast:", e.matches);
      setA11yState((prev) => ({ ...prev, highContrast: e.matches }));
    };

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // スクリーンリーダー検出
  useEffect(() => {
    const hasScreenReader =
      "speechSynthesis" in window ||
      navigator.userAgent.includes("NVDA") ||
      navigator.userAgent.includes("JAWS") ||
      navigator.userAgent.includes("VoiceOver");

    setA11yState((prev) => ({ ...prev, screenReader: hasScreenReader }));
  }, []);

  // フォーカス可視性検出
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setA11yState((prev) => ({ ...prev, focusVisible: true }));
      }
    };

    const handleMouseDown = () => {
      setA11yState((prev) => ({ ...prev, focusVisible: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return a11yState;
};

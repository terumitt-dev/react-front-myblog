// app/src/hooks/__tests__/useAccessibility.test.ts
import { renderHook } from "@testing-library/react";
import { useAccessibility } from "../useAccessibility";

describe("useAccessibility", () => {
  it("should return initial accessibility state", () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current).toEqual({
      reducedMotion: false,
      highContrast: false,
      screenReader: false,
      focusVisible: false,
    });
  });

  it("should detect reduced motion preference", () => {
    // matchMediaをモック
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    const { result } = renderHook(() => useAccessibility());
    expect(result.current.reducedMotion).toBe(true);
  });
});

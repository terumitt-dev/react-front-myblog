// app/src/hooks/useTheme.ts（別解）
import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export const useThemeManager = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isHydrated, setIsHydrated] = useState(false);

  // 初期化
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
      setTheme(initialTheme);

      // documentElementのクラスを更新（React管理下で実行）
      updateDocumentClass(initialTheme);
    } catch (error) {
      console.warn("Theme initialization failed:", error);
      setTheme("light");
      updateDocumentClass("light");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // テーマ変更時にdocumentElementも更新
  useEffect(() => {
    if (isHydrated) {
      updateDocumentClass(theme);

      try {
        localStorage.setItem("theme", theme);
      } catch (error) {
        console.warn("Failed to save theme:", error);
      }
    }
  }, [theme, isHydrated]);

  // DOM操作を一箇所に集約
  const updateDocumentClass = (newTheme: Theme) => {
    if (typeof document === "undefined") return; // SSR対応

    const { documentElement } = document;

    if (newTheme === "dark") {
      documentElement.classList.add("dark");
    } else {
      documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return {
    theme,
    toggleTheme,
    isHydrated,
  };
};

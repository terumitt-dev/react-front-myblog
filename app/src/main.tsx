// app/src/main.tsx
// より安全なFOUC対策
(() => {
  try {
    // SSR環境チェック
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (error) {
    // localStorageアクセスエラー（プライベートモードなど）
    console.warn("Theme initialization failed:", error);
    // デフォルトでライトテーマを適用
    document.documentElement.classList.remove("dark");
  }
})();

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// 開発環境でMSWを起動
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === "true") {
    const { worker } = await import("./mocks/browser");

    return worker.start({
      onUnhandledRequest: "warn",
    });
  }
  return Promise.resolve();
}

enableMocking().then(() => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </React.StrictMode>,
    );
  } else {
    console.error("Root element not found");
  }
});

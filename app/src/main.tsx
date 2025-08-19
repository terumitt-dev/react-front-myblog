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

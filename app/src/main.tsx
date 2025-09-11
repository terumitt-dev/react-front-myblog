// app/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// MSWの初期化（修正版）
async function enableMocking() {
  if (!import.meta.env.DEV) {
    console.log("📦 Production mode: MSW disabled");
    return;
  }

  try {
    console.log("🔧 Development mode: Initializing MSW...");
    const { worker } = await import("./mocks/browser");

    // 強制的にMSWを開始（重複チェックを削除）
    await worker.start({
      onUnhandledRequest: "bypass", // 処理されないリクエストは通す
      quiet: false,
    });
    console.log("✅ MSW initialized successfully");

    // ハンドラーの確認
    console.log("📋 MSW handlers registered:", worker.listHandlers().length);
  } catch (error) {
    console.error("❌ MSW initialization failed:", error);
    // MSWが失敗してもアプリは起動する
  }
}

// アプリケーション起動
enableMocking()
  .then(() => {
    console.log("🚀 Starting React application...");
    const root = createRoot(document.getElementById("root")!);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log("✅ React application started");
  })
  .catch((error) => {
    console.error("💥 Failed to start application:", error);
  });

// app/src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// 開発用の環境変数チェック
if (import.meta.env.DEV) {
  if (
    !import.meta.env.VITE_DEV_ADMIN_EMAIL ||
    !import.meta.env.VITE_DEV_ADMIN_PASSWORD
  ) {
    console.error("Warning: Development admin credentials are not configured.");
    console.error(
      "Please set VITE_DEV_ADMIN_EMAIL and VITE_DEV_ADMIN_PASSWORD in your .env file.",
    );
    console.error("Example:");
    console.error("VITE_DEV_ADMIN_EMAIL=admin@example.com");
    console.error("VITE_DEV_ADMIN_PASSWORD=password123");
  }
}

// Service Workerを設定
export const worker = setupWorker(...handlers);

// 開発環境でのデバッグを有効にする
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: "warn",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}

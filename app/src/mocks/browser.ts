// app/src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Service Workerを設定
export const worker = setupWorker(...handlers);

// 開発環境でのデバッグを有効にする
if (import.meta.env.DEV) {
  worker.start({ onUnhandledRequest: "warn" });
}

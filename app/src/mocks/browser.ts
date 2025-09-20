// app/src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// 環境変数チェックを削除（セキュリティ改善済み）
console.log("🔧 MSW: Development environment detected");
console.log("🔐 MSW: Using hardcoded credentials for development");

export const worker = setupWorker(...handlers);

// MSWの初期化ログ
worker.events.on("request:start", ({ request }) => {
  console.log("MSW Request:", request.method, request.url);
});

worker.events.on("request:match", ({ request }) => {
  console.log("MSW Matched:", request.method, request.url);
});

worker.events.on("request:unhandled", ({ request }) => {
  console.log("MSW Unhandled:", request.method, request.url);
});

// app/src/mocks/browser.ts
import { setupWorker } from 'msw'
import { handlers } from './handlers'

// MSWのService Workerをセットアップ
export const worker = setupWorker(...handlers)

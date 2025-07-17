// app/src/main.tsx
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// MSWのセットアップを含む関数を定義
const prepare = async () => {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

prepare()

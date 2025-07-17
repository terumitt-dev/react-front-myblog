// app/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const prepare = async () => {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

prepare()

// // app/src/main.tsx
// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'
// import './index.css'

// // biome-ignore lint/style/noNonNullAssertion: <explanation>
// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// )

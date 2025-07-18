// app/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    console.log('🟡 MSW importing...')
    await worker.start()
    console.log('🟢 MSW started')
  }
}

prepare().then(() => {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})

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

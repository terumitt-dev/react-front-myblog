// app/src/App.tsx
// import { BrowserRouter } from 'react-router-dom'
// import Router from '@/router/Router'
// import { AuthProvider } from '@/context/AuthContext'

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Router />
//       </AuthProvider>
//     </BrowserRouter>
//   )
// }

// export default App

// app/src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import Router from '@/router/Router'
import { AuthProvider } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/utils/ErrorBoundary'

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

// app/src/App.tsx
import { BrowserRouter } from 'react-router-dom'
import Router from '@/router/Router'
import { AuthProvider } from '@/context/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

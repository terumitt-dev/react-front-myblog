// app/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
  isLoggedIn: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('myblog-auth')
    setIsLoggedIn(stored === 'true')
  }, [])

  const login = (email: string, password: string) => {
    // ← Deviseに置き換える想定
    if (email === 'admin@example.com' && password === 'password') {
      setIsLoggedIn(true)
      localStorage.setItem('myblog-auth', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('myblog-auth')
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

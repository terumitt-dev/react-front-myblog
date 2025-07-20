// app/src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react'

type AuthContextType = {
  isLoggedIn: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('myblog-auth') === 'true'
  )

  const login = (email: string, password: string) => {
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD

    if (!devEmail || !devPassword) {
      console.error('環境変数が不足しています')
      throw new Error('VITE_DEV_ADMIN_EMAIL または VITE_DEV_ADMIN_PASSWORD が未定義です')
    }

    if (email === devEmail && password === devPassword) {
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

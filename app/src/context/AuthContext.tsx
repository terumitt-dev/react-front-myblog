// app/src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react'

type AuthContextType = {
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('myblog-auth') === 'true'
  )

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error('Invalid credentials')

      const data = await res.json()

      // 成功とみなしてログイン状態更新
      setIsLoggedIn(true)
      localStorage.setItem('myblog-auth', 'true')
      return true
    } catch (err) {
      console.error('Login failed:', err)
      return false
    }
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

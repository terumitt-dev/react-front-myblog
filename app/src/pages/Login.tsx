// app/src/pages/Login.tsx
import Layout from '@/components/layouts/Layout'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setError('メールアドレスとパスワードを入力してください。')
      return
    }

    const ok = login(email, password)
    if (ok) {
      navigate('/admin')
    } else {
      setError('ログインに失敗しました。')
    }
  }

  return (
    <Layout>
      <div className="p-6 space-y-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold">ログイン</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
          />
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            ログイン
          </button>
        </form>
      </div>
    </Layout>
  )
}

export default Login

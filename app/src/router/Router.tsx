// src/router/Router.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Top from '@/pages/Top'
import Category from '@/pages/Category'
import PostDetail from '@/pages/PostDetail'
import Admin from '@/pages/Admin'
import Login from '@/pages/Login'
import { useAuth } from '@/context/AuthContext'

const Router = () => {
  const { isLoggedIn } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Top />} />
      <Route path="/category/:category" element={<Category />} />
      <Route path="/posts/:id" element={<PostDetail />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={isLoggedIn ? <Admin /> : <Navigate to="/login" />}
      />
    </Routes>
  )
}

export default Router

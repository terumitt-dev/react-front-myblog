import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Top from '@/pages/Top'
import Home from '@/pages/Home'
import Category from '@/pages/Category'
import PostDetail from '@/pages/PostDetail'
import Admin from '@/pages/Admin' // ← 追加！

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/home" element={<Home />} />
        <Route path="/category/:category" element={<Category />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/admin" element={<Admin />} /> {/* ← 追加！ */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;

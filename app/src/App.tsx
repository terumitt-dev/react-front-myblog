// app/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Top from '@/pages/Top'
import Home from '@/pages/Home'
import CategoryPage from '@/pages/Category'
import PostDetail from '@/pages/PostDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/home" element={<Home />} />
        <Route path="/category/:category" element={<Category />} />
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;

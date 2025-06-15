// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Top from './pages/Top'
import Hobby from './pages/category/Hobby'
import Tech from './pages/category/Tech'
import Other from './pages/category/Other'

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Top />} />
      <Route path="/category/hobby" element={<Hobby />} />
      <Route path="/category/tech" element={<Tech />} />
      <Route path="/category/other" element={<Other />} />
    </Routes>
  </BrowserRouter>
)

export default App

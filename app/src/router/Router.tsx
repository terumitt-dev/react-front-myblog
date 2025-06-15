// src/router/Router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Top from "../pages/Top";
import PostDetail from "../pages/PostDetail";
import Comment from "../pages/Comment";
import Category from "../pages/Category";
import Admin from "../pages/Admin";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/:id/comments" element={<Comment />} />
        <Route path="/categories/:genre" element={<Category />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

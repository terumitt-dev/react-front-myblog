// src/router/Router.tsx
import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Top from "@/pages/Top";
import Category from "@/pages/Category";
import PostDetail from "@/pages/PostDetail";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import { useAuth } from "@/hooks/useAuth";
import { ResettableErrorBoundary } from "@/components/utils/ResettableErrorBoundary";

function AdminPageWrapper() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <ResettableErrorBoundary
      key={resetKey}
      fallback={({ error, resetErrorBoundary }) => (
        <div>
          <p>エラー: {error.message}</p>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("myblog-posts");
              setResetKey((prev) => prev + 1);
              resetErrorBoundary();
            }}
          >
            やり直す
          </button>
        </div>
      )}
    >
      <Admin />
    </ResettableErrorBoundary>
  );
}

const Router = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Top />} />
      <Route path="/category/:category" element={<Category />} />
      <Route path="/posts/:id" element={<PostDetail />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          isLoggedIn ? (
            <AdminPageWrapper />
          ) : (
            <Navigate replace to="/login" state={{ from: location }} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;

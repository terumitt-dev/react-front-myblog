// app/src/pages/Login.tsx
import Layout from "@/components/layouts/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// シンプルなcn関数（shadcn/uiパターンを参考）
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    const ok = login(email, password);
    if (ok) {
      navigate("/admin");
    } else {
      setError("ログインに失敗しました。");
    }
  };

  return (
    <Layout>
      <div className={cn("p-6 space-y-4 max-w-md mx-auto")}>
        <h1 className={cn("text-xl font-bold")}>ログイン</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className={cn("space-y-4")}
        >
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn("border p-2 w-full")}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn("border p-2 w-full")}
          />
          {error && <p className={cn("text-red-600")}>{error}</p>}
          <button
            type="submit"
            className={cn(
              "w-full px-4 py-2 rounded text-white",
              "bg-blue-600 hover:bg-blue-700",
              "transition duration-200",
            )}
          >
            ログイン
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Login;

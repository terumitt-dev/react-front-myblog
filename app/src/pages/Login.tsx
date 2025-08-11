// app/src/pages/Login.tsx
import Layout from "@/components/layouts/Layout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// シンプルなcn関数（shadcn/uiパターンを参考）
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/admin");
      } else {
        // 型に合わせて修正：locked と retryAfter を削除
        if (result.error === "invalid_config") {
          setError("ログイン設定が不正です。管理者に連絡してください。");
        } else if (result.error === "production_disabled") {
          setError("本番環境では開発用ログインは使用できません。");
        } else {
          setError("ログインに失敗しました。");
        }
      }
    } catch {
      setError("ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // シンプルな無効状態判定
  const isDisabled = loading;

  return (
    <Layout>
      <div className={cn("p-6 space-y-4 max-w-md mx-auto")}>
        <h1 className={cn("text-xl font-bold text-gray-900 dark:text-white")}>
          ログイン
        </h1>
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
            className={cn(
              "border border-gray-300 dark:border-gray-600 p-2 w-full rounded",
              "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
              "placeholder-gray-500 dark:placeholder-gray-400",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-colors",
            )}
            disabled={isDisabled}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "border border-gray-300 dark:border-gray-600 p-2 w-full rounded",
              "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
              "placeholder-gray-500 dark:placeholder-gray-400",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-colors",
            )}
            disabled={isDisabled}
          />
          {error && (
            <p className={cn("text-red-600 dark:text-red-400 text-sm")}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isDisabled}
            className={cn(
              "w-full px-4 py-2 rounded text-white",
              "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "transition duration-200",
              isDisabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Login;

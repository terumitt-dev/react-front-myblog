// app/src/context/AuthContext.tsx
import { createContext, useContext, useState } from "react";

// ⚠️ 重要な注意事項 ⚠️
// このコードは開発/デモ用途のみです。
// 本番環境では以下が必要です：
// - サーバー側での認証処理とセッション管理
// - JWT/OAuth等のセキュアな認証方式
// - サーバー側でのレート制限とブルートフォース対策
// - HTTPS必須、セキュアなCookie使用
// - 適切なCSRF対策
// - パスワードのハッシュ化（サーバー側）

type LoginResult = {
  success: boolean;
  error?: "invalid_config" | "invalid_credentials";
};

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 開発用：localStorageから認証状態を復元
    if (typeof window !== "undefined") {
      return localStorage.getItem("myblog-auth") === "true";
    }
    return false;
  });

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    // 環境変数から開発用の認証情報を取得
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

    // 環境変数チェック
    if (!devEmail || !devPassword) {
      console.error("開発用環境変数が設定されていません");
      console.warn(
        "VITE_DEV_ADMIN_EMAIL と VITE_DEV_ADMIN_PASSWORD を設定してください",
      );
      return { success: false, error: "invalid_config" };
    }

    // シンプルな認証チェック（開発用）
    if (email === devEmail && password === devPassword) {
      setIsLoggedIn(true);
      localStorage.setItem("myblog-auth", "true");
      return { success: true };
    }

    // 認証失敗
    return {
      success: false,
      error: "invalid_credentials",
    };
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("myblog-auth");
    // 以前の失敗情報もクリア（念のため）
    localStorage.removeItem("myblog-auth-fails");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

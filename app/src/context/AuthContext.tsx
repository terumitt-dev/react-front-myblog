// app/src/context/AuthContext.tsx
import { createContext, useState, useEffect, useCallback } from "react";

// ⚠️ 重要：本番環境では絶対に使用しないでください
// この実装は開発環境専用の簡易認証システムです

type LoginResult = {
  success: boolean;
  error?:
    | "network_error"
    | "invalid_credentials"
    | "production_disabled"
    | "development_only";
};

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isDevelopmentMode: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 開発環境チェック（厳格）
const isDevelopmentEnvironment = (): boolean => {
  // SSR対応
  if (typeof window === "undefined") return false;

  // 複数条件での厳格チェック
  return (
    import.meta.env.DEV && // Viteの開発モード
    import.meta.env.MODE === "development" && // NODE_ENVチェック
    !import.meta.env.PROD && // 本番環境ではない
    window.location.hostname === "localhost" && // localhostでのみ動作
    (window.location.port === "5173" || // Vite開発サーバー
      window.location.port === "3000") // 代替ポート
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isDevelopmentMode = isDevelopmentEnvironment();

  // 開発環境チェック（初期化時）
  useEffect(() => {
    if (!isDevelopmentMode) {
      console.warn("🚫 認証システムは開発環境でのみ利用可能です");
      return;
    }

    // セッション確認（開発環境のみ）
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch("/api/auth/me", {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          // トークンが無効な場合はクリアする
          localStorage.removeItem("auth_token");
          localStorage.removeItem("admin_data");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log("認証状態の確認に失敗（開発環境）:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, [isDevelopmentMode]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      // 本番環境ガード（最優先）
      if (!isDevelopmentMode) {
        console.error("🚫 本番環境: 認証機能は無効化されています");
        return { success: false, error: "production_disabled" };
      }

      // 入力値検証
      if (!email || !password) {
        return { success: false, error: "invalid_credentials" };
      }

      try {
        // モックAPI経由での認証（環境変数を使用しない）
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          console.log("🔒 開発環境: ログイン失敗");
          return { success: false, error: "invalid_credentials" };
        }

        const data = await response.json();

        // MSWハンドラーのレスポンス形式に合わせて修正
        if (data.token && data.admin) {
          setIsLoggedIn(true);
          console.log("✅ 開発環境: ログイン成功");

          // トークンをローカルストレージに保存（開発環境のみ）
          localStorage.setItem("auth_token", data.token);
          localStorage.setItem("admin_data", JSON.stringify(data.admin));

          return { success: true };
        } else {
          return { success: false, error: "invalid_credentials" };
        }
      } catch (error) {
        console.error("開発環境: 認証エラー", error);
        return { success: false, error: "network_error" };
      }
    },
    [isDevelopmentMode],
  );

  const logout = useCallback(async () => {
    if (!isDevelopmentMode) {
      console.warn("🚫 本番環境: ログアウト機能は無効化されています");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });
    } finally {
      // ローカルストレージをクリア
      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_data");
      setIsLoggedIn(false);
      console.log("🚪 開発環境: ログアウト完了");
    }
  }, [isDevelopmentMode]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isDevelopmentMode ? isLoggedIn : false,
        login,
        logout,
        isDevelopmentMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

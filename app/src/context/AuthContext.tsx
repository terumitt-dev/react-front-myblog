// app/src/context/AuthContext.tsx
import { createContext, useState, useCallback } from "react";

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
  token: string | null;
  getAuthToken: () => string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const isDevelopmentMode = isDevelopmentEnvironment();

  // トークン取得関数
  const getAuthToken = useCallback(() => token, [token]);

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
        // モックAPI経由での認証
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

        // MSWハンドラーのレスポンス形式に合わせて処理
        if (data.token && data.admin) {
          setIsLoggedIn(true);
          setToken(data.token);
          console.log("✅ 開発環境: ログイン成功（メモリ管理）");

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
      // ログアウトAPI呼び出し（トークン付き）
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } finally {
      // メモリから全てクリア
      setIsLoggedIn(false);
      setToken(null);
      console.log("🚪 開発環境: ログアウト完了（メモリクリア）");
    }
  }, [isDevelopmentMode, token]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isDevelopmentMode ? isLoggedIn : false,
        token,
        getAuthToken,
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

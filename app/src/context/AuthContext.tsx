// app/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { handleStorageError } from "../components/utils/errorHandler";

// 複数の環境変数チェックで堅牢性を向上
const NODE_ENV = import.meta.env.MODE;
const IS_DEV_BUILD = import.meta.env.DEV;
const FORCE_DISABLE_AUTH = import.meta.env.VITE_FORCE_DISABLE_AUTH === "true";
const IS_PRODUCTION = import.meta.env.PROD;

// より厳格な開発環境判定
const isDevelopment =
  IS_DEV_BUILD &&
  NODE_ENV !== "production" &&
  !IS_PRODUCTION &&
  !FORCE_DISABLE_AUTH &&
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.includes("dev"));

// セキュリティ警告
if (!isDevelopment) {
  console.warn("🚫 認証システム: 本番環境では完全無効化");
  // 本番環境では認証関連データを即座にクリア
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("myblog-auth");
      sessionStorage.removeItem("myblog-auth-session");
      localStorage.removeItem("myblog-auth-fails");
    } catch (error) {
      handleStorageError(error, "cleanup");
    }
  }
} else {
  console.warn("⚠️ 開発用認証システムが有効 - 本番では自動無効化されます");
}

// ビルド時情報ログ（本番では出力されない）
if (isDevelopment) {
  console.log(
    `🔍 Build Info: MODE=${NODE_ENV}, DEV=${IS_DEV_BUILD}, PROD=${IS_PRODUCTION}, AUTH_DISABLED=${FORCE_DISABLE_AUTH}`,
  );
}

type LoginResult = {
  success: boolean;
  error?:
    | "invalid_config"
    | "invalid_credentials"
    | "production_disabled"
    | "build_error"
    | "security_violation";
};

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isDevelopmentMode: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// セッション用のキー（開発環境でのみ使用）
const SESSION_KEY = "myblog-auth-session";
const STORAGE_KEY = "myblog-auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 本番環境では常にfalse
    if (!isDevelopment) {
      return false;
    }

    // 開発環境: sessionStorageを優先、fallbackとしてlocalStorage
    if (typeof window !== "undefined") {
      try {
        const sessionAuth = sessionStorage.getItem(SESSION_KEY);
        const persistentAuth = localStorage.getItem(STORAGE_KEY);

        // セッション認証が優先
        if (sessionAuth === "true") {
          return true;
        }

        // localStorage認証（ページリロード対応）
        if (persistentAuth === "true") {
          // sessionStorageにも同期
          sessionStorage.setItem(SESSION_KEY, "true");
          return true;
        }
      } catch (error) {
        handleStorageError(error, "read auth state");
      }
    }
    return false;
  });

  // 本番環境での追加セキュリティチェック
  useEffect(() => {
    if (!isDevelopment && isLoggedIn) {
      console.error("🚨 セキュリティ違反: 本番環境での不正な認証状態を検出");
      setIsLoggedIn(false);
      // 全ての認証データをクリア
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(SESSION_KEY);
          localStorage.removeItem("myblog-auth-fails");
        } catch (error) {
          handleStorageError(error, "security cleanup");
        }
      }
    }
  }, [isLoggedIn]);

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    // 本番環境での厳格ガード
    if (!isDevelopment) {
      console.error("🚫 本番環境: 開発用認証は完全無効化されています");
      return { success: false, error: "production_disabled" };
    }

    // ホスト名チェック（追加セキュリティ）
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isValidHost =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.includes("dev");

      if (!isValidHost) {
        console.error(
          "🚨 セキュリティ違反: 不正なホストからのアクセス",
          hostname,
        );
        return { success: false, error: "security_violation" };
      }
    }

    // 環境変数の厳格チェック
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

    // ビルド時置換エラーチェック
    if (devEmail === "undefined" || devPassword === "undefined") {
      console.error(
        "❌ ビルド時置換エラー: 環境変数が正しく設定されていません",
      );
      return { success: false, error: "build_error" };
    }

    if (!devEmail || !devPassword) {
      console.error("❌ 開発用環境変数が設定されていません");
      console.warn(
        "VITE_DEV_ADMIN_EMAIL と VITE_DEV_ADMIN_PASSWORD を設定してください",
      );
      return { success: false, error: "invalid_config" };
    }

    // 認証チェック
    if (email === devEmail && password === devPassword) {
      setIsLoggedIn(true);

      // sessionStorageとlocalStorage両方に保存（セキュリティと利便性のバランス）
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(SESSION_KEY, "true");
          localStorage.setItem(STORAGE_KEY, "true");
        } catch (error) {
          handleStorageError(error, "save auth state");
        }
      }

      console.log("✅ 開発用ログイン成功");
      return { success: true };
    }

    // 認証失敗
    console.warn("❌ 開発用ログイン失敗");
    return {
      success: false,
      error: "invalid_credentials",
    };
  };

  const logout = () => {
    setIsLoggedIn(false);

    // 全ての認証データをクリア
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("myblog-auth-fails");
      } catch (error) {
        handleStorageError(error, "logout cleanup");
      }
    }

    console.log("🚪 ログアウト完了");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        isDevelopmentMode: isDevelopment,
      }}
    >
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

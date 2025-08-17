// app/src/context/AuthContext.tsx
import { createContext, useState, useEffect } from "react";
import { handleStorageError } from "@/components/utils/errorHandler";

// 複数の環境変数チェックで堅牢性を向上
const NODE_ENV = import.meta.env.MODE;
const IS_DEV_BUILD = import.meta.env.DEV;
const FORCE_DISABLE_AUTH = import.meta.env.VITE_FORCE_DISABLE_AUTH === "true";
const IS_PRODUCTION = import.meta.env.PROD;

// 🔧 修正: より柔軟な開発環境判定（ログイン可能にする）
const checkDevelopmentMode = (): boolean => {
  // SSR時は false
  if (typeof window === "undefined") return false;

  // 基本条件
  const basicConditions =
    IS_DEV_BUILD &&
    NODE_ENV !== "production" &&
    !IS_PRODUCTION &&
    !FORCE_DISABLE_AUTH;

  // ホスト条件（より柔軟に）
  const hostname = window.location.hostname;
  const isValidHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.includes("dev") ||
    hostname.includes("local");

  return basicConditions && isValidHost;
};

// 🔧 修正: 初期化処理を関数内で実行（SSR安全）
const initializeAuthSecurity = () => {
  // SSR時はスキップ
  if (typeof window === "undefined") return;

  const isDev = checkDevelopmentMode();

  if (!isDev) {
    // 本番環境: 最小限の警告のみ
    console.warn("🚫 Auth: Production mode - Authentication disabled");

    // ストレージクリア
    try {
      localStorage.removeItem("myblog-auth");
      sessionStorage.removeItem("myblog-auth-session");
      localStorage.removeItem("myblog-auth-fails");
    } catch (error) {
      handleStorageError(error, "cleanup");
    }
  } else {
    // 開発環境: 詳細ログ
    console.warn("⚠️ 開発用認証システムが有効 - 本番では自動無効化されます");
    console.log(
      `🔍 Build Info: MODE=${NODE_ENV}, DEV=${IS_DEV_BUILD}, PROD=${IS_PRODUCTION}, AUTH_DISABLED=${FORCE_DISABLE_AUTH}`,
    );
  }
};

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

// セッション用のキー
const SESSION_KEY = "myblog-auth-session";
const STORAGE_KEY = "myblog-auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // 🔧 修正: 初期化をuseEffect内で実行
  useEffect(() => {
    initializeAuthSecurity();
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // SSR時は false
    if (typeof window === "undefined") return false;

    const isDev = checkDevelopmentMode();

    // 本番環境では常にfalse
    if (!isDev) return false;

    // 開発環境: ストレージチェック
    try {
      const sessionAuth = sessionStorage.getItem(SESSION_KEY);
      const persistentAuth = localStorage.getItem(STORAGE_KEY);

      if (sessionAuth === "true") {
        return true;
      }

      if (persistentAuth === "true") {
        sessionStorage.setItem(SESSION_KEY, "true");
        return true;
      }
    } catch (error) {
      handleStorageError(error, "read auth state");
    }

    return false;
  });

  // 本番環境での追加セキュリティチェック
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDev = checkDevelopmentMode();

    if (!isDev && isLoggedIn) {
      console.error("🚨 Security violation: Unauthorized auth state detected");
      setIsLoggedIn(false);

      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem("myblog-auth-fails");
      } catch (error) {
        handleStorageError(error, "security cleanup");
      }
    }
  }, [isLoggedIn]);

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    // SSR時のチェック
    if (typeof window === "undefined") {
      return { success: false, error: "build_error" };
    }

    const isDev = checkDevelopmentMode();

    // 本番環境ガード
    if (!isDev) {
      console.error("🚫 Production: Development authentication is disabled");
      return { success: false, error: "production_disabled" };
    }

    // 🔧 修正: ホスト名チェックは既に checkDevelopmentMode() で実行済み

    // 環境変数チェック
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

    // ビルド時置換エラーチェック
    if (devEmail === "undefined" || devPassword === "undefined") {
      console.error(
        "❌ Build replacement error: Environment variables not properly configured",
      );
      return { success: false, error: "build_error" };
    }

    if (!devEmail || !devPassword) {
      console.error("❌ Development environment variables not configured");
      console.warn(
        "Please set VITE_DEV_ADMIN_EMAIL and VITE_DEV_ADMIN_PASSWORD",
      );
      return { success: false, error: "invalid_config" };
    }

    // 認証チェック
    if (email === devEmail && password === devPassword) {
      setIsLoggedIn(true);

      try {
        sessionStorage.setItem(SESSION_KEY, "true");
        localStorage.setItem(STORAGE_KEY, "true");
      } catch (error) {
        handleStorageError(error, "save auth state");
      }

      console.log("✅ Development login successful");
      return { success: true };
    }

    console.warn("❌ Development login failed");
    return {
      success: false,
      error: "invalid_credentials",
    };
  };

  const logout = () => {
    setIsLoggedIn(false);

    if (typeof window === "undefined") return;

    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("myblog-auth-fails");
    } catch (error) {
      handleStorageError(error, "logout cleanup");
    }

    const isDev = checkDevelopmentMode();
    if (isDev) {
      console.log("🚪 Logout completed");
    }
  };

  // 🔧 修正: 動的にdevelopmentModeを判定
  const isDevelopmentMode =
    typeof window !== "undefined" ? checkDevelopmentMode() : false;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
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

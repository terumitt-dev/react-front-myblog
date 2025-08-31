// app/src/context/AuthContext.tsx
import { createContext, useState, useEffect } from "react";
import { authApi } from "@/api/client";

// 複数の環境変数チェックで堅牢性を向上
const NODE_ENV = import.meta.env.MODE;
const IS_DEV_BUILD = import.meta.env.DEV;
const FORCE_DISABLE_AUTH = import.meta.env.VITE_FORCE_DISABLE_AUTH === "true";
const IS_PRODUCTION = import.meta.env.PROD;

// 共通: 許可ホストリストを取得する関数
const getAllowedHosts = (): string[] => {
  const defaultHosts = ["localhost", "127.0.0.1", "0.0.0.0"];
  return defaultHosts;
};

// 共通: ホスト検証を行う関数
const isHostAllowed = (): boolean => {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;
  const allowedHosts = getAllowedHosts();
  return allowedHosts.includes(hostname);
};

// 本番動作ガード強化 - 厳格なホスト制御
const checkDevelopmentMode = (): boolean => {
  // SSR時は false
  if (typeof window === "undefined") return false;

  // 基本条件
  const basicConditions =
    IS_DEV_BUILD &&
    NODE_ENV !== "production" &&
    !IS_PRODUCTION &&
    !FORCE_DISABLE_AUTH;

  // 共通のホスト検証を使用
  const isValidHost = isHostAllowed();

  return basicConditions && isValidHost;
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
const TOKEN_KEY = "token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // SSR時は false
    if (typeof window === "undefined") return false;

    // トークンの存在をチェック
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error("Failed to read token from localStorage:", error);
      return false;
    }
  });

  // 認証状態の監視
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn) return;

      try {
        // 認証状態をチェック
        const response = await authApi.me();
        if ("error" in response) {
          setIsLoggedIn(false);
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch (error) {
        setIsLoggedIn(false);
        localStorage.removeItem(TOKEN_KEY);
      }
    };

    checkAuth();
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

    // 共通のホスト検証を使用
    if (!isHostAllowed()) {
      const hostname = window.location.hostname;
      const allowedHosts = getAllowedHosts();
      console.error(
        "🚨 Security violation: Unauthorized host access:",
        hostname,
        "Allowed hosts:",
        allowedHosts,
      );
      return { success: false, error: "security_violation" };
    }

    // 環境変数チェック
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

    // ビルド時置換エラーチェック
    if (devEmail === "undefined" || devPassword === "undefined") {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "❌ Build replacement error: Environment variables not properly configured",
        );
      }
      return { success: false, error: "build_error" };
    }

    if (!devEmail || !devPassword) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Development environment variables not configured");
        console.warn(
          "Please set VITE_DEV_ADMIN_EMAIL and VITE_DEV_ADMIN_PASSWORD",
        );
      }
      return { success: false, error: "invalid_config" };
    }

    try {
      const response = await authApi.login(email, password);

      if ("error" in response) {
        if (process.env.NODE_ENV === "development") {
          console.warn("❌ Development login failed");
        }
        return { success: false, error: "invalid_credentials" };
      }

      // トークンを保存
      try {
        const { token } = response.data;
        localStorage.setItem(TOKEN_KEY, token);
        setIsLoggedIn(true);

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Development login successful");
        }
        return { success: true };
      } catch (error) {
        console.error("Failed to save token to localStorage:", error);
        return { success: false, error: "build_error" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "invalid_credentials" };
    }
  };

  const logout = async () => {
    const isDev = checkDevelopmentMode();

    try {
      await authApi.logout();
    } finally {
      setIsLoggedIn(false);
      try {
        localStorage.removeItem(TOKEN_KEY);

        if (isDev && process.env.NODE_ENV === "development") {
          console.log("🚪 Logout completed");
        }
      } catch (error) {
        console.error("Failed to remove token from localStorage:", error);
      }
    }
  };

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

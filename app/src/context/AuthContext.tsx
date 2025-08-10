// app/src/context/AuthContext.tsx
import { createContext, useContext, useState } from "react";

type LoginResult = {
  success: boolean;
  error?: "locked" | "invalid_config" | "invalid_credentials";
  retryAfter?: number; // バックオフ時間（ミリ秒）
};

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// メモリ上の失敗カウンタ（プロセス単位で管理）
const failMemoryRef = { count: 0, until: 0 };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("myblog-auth") === "true",
  );

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

    const now = Date.now();
    const persisted = localStorage.getItem("myblog-auth-fails");
    const persistedInfo: { until?: number; tryAfter?: number } = persisted
      ? JSON.parse(persisted)
      : {};

    // メモリ上のカウンタを優先し、持続ロックは localStorage の until のみに限定
    if (
      (persistedInfo.until && now < persistedInfo.until) ||
      (failMemoryRef.until && now < failMemoryRef.until)
    ) {
      return { success: false, error: "locked" };
    }

    // バックオフ待機時間チェック
    if (persistedInfo.tryAfter && now < persistedInfo.tryAfter) {
      return {
        success: false,
        error: "locked",
        retryAfter: persistedInfo.tryAfter - now,
      };
    }

    if (!devEmail || !devPassword) {
      console.error("環境変数が不足しています");
      return { success: false, error: "invalid_config" };
    }

    if (email === devEmail && password === devPassword) {
      setIsLoggedIn(true);
      localStorage.setItem("myblog-auth", "true");
      localStorage.removeItem("myblog-auth-fails");
      failMemoryRef.count = 0;
      failMemoryRef.until = 0;
      return { success: true };
    }

    // 失敗時: 簡易バックオフ（最大2秒）
    failMemoryRef.count = (failMemoryRef.count || 0) + 1;
    const backoffMs = Math.min(
      2000,
      200 * Math.pow(2, failMemoryRef.count - 1),
    );
    const lockThreshold = 5;

    if (failMemoryRef.count >= lockThreshold) {
      const until = now + 5 * 60_000;
      failMemoryRef.count = 0;
      failMemoryRef.until = until;
      localStorage.setItem("myblog-auth-fails", JSON.stringify({ until }));
    } else {
      // 次回試行までの待機時間を保存
      const tryAfter = now + backoffMs;
      localStorage.setItem("myblog-auth-fails", JSON.stringify({ tryAfter }));
    }

    // バックオフ実行
    await new Promise((resolve) => setTimeout(resolve, backoffMs));

    return {
      success: false,
      error: "invalid_credentials",
      retryAfter: backoffMs,
    };
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("myblog-auth");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

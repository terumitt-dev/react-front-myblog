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

// 永続化された状態を読み込み
const loadFailState = () => {
  const raw = localStorage.getItem("myblog-auth-fails");
  if (!raw) return { count: 0, until: 0, tryAfter: 0 };
  try {
    const parsed = JSON.parse(raw) as {
      count?: number;
      until?: number;
      tryAfter?: number;
    };
    return {
      count: typeof parsed.count === "number" ? parsed.count : 0,
      until: typeof parsed.until === "number" ? parsed.until : 0,
      tryAfter: typeof parsed.tryAfter === "number" ? parsed.tryAfter : 0,
    };
  } catch {
    localStorage.removeItem("myblog-auth-fails");
    return { count: 0, until: 0, tryAfter: 0 };
  }
};

const saveFailState = (state: {
  count?: number;
  until?: number;
  tryAfter?: number;
}) => {
  localStorage.setItem("myblog-auth-fails", JSON.stringify(state));
};

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

    if (!devEmail || !devPassword) {
      console.error("環境変数が不足しています");
      return { success: false, error: "invalid_config" };
    }

    // 早期成功判定で確実にクリア
    if (email === devEmail && password === devPassword) {
      setIsLoggedIn(true);
      localStorage.setItem("myblog-auth", "true");
      // 失敗・ロック・待機情報を完全にクリア
      localStorage.removeItem("myblog-auth-fails");
      failMemoryRef.count = 0;
      failMemoryRef.until = 0;
      return { success: true };
    }

    const now = Date.now();
    const persistedInfo = loadFailState();

    // ロック中の判定（優先）
    const lockUntil = persistedInfo.until || failMemoryRef.until || 0;
    if (lockUntil && now < lockUntil) {
      return { success: false, error: "locked", retryAfter: lockUntil - now };
    }

    // バックオフ待機時間チェック
    if (persistedInfo.tryAfter && now < persistedInfo.tryAfter) {
      return {
        success: false,
        error: "locked",
        retryAfter: persistedInfo.tryAfter - now,
      };
    }

    // 失敗時
    const nextCount = (persistedInfo.count || failMemoryRef.count || 0) + 1;
    failMemoryRef.count = nextCount;
    const backoffMs = Math.min(2000, 200 * Math.pow(2, nextCount - 1));
    const lockThreshold = 5;

    if (nextCount >= lockThreshold) {
      const until = now + 5 * 60_000;
      failMemoryRef.count = 0;
      failMemoryRef.until = until;
      saveFailState({ count: 0, until });
    } else {
      const tryAfter = now + backoffMs;
      saveFailState({ count: nextCount, tryAfter });
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
    localStorage.removeItem("myblog-auth-fails"); // 失敗/ロック情報もクリア
    failMemoryRef.count = 0;
    failMemoryRef.until = 0;
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

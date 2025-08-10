// app/src/context/AuthContext.tsx
import { createContext, useContext, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// メモリ上の失敗カウンタ（プロセス単位で管理）
const failMemoryRef = { count: 0, until: 0 };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("myblog-auth") === "true",
  );

  const login = (email: string, password: string) => {
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

    const now = Date.now();
    const persisted = localStorage.getItem("myblog-auth-fails");
    const persistedInfo: { until?: number } = persisted
      ? JSON.parse(persisted)
      : {};

    // メモリ上のカウンタを優先し、持続ロックは localStorage の until のみに限定
    if (
      (persistedInfo.until && now < persistedInfo.until) ||
      (failMemoryRef.until && now < failMemoryRef.until)
    ) {
      alert("しばらくしてから再試行してください。");
      return false;
    }

    if (!devEmail || !devPassword) {
      console.error("環境変数が不足しています");
      alert("ログイン設定が不正です。管理者に連絡してください。");
      return false;
    }

    if (email === devEmail && password === devPassword) {
      setIsLoggedIn(true);
      localStorage.setItem("myblog-auth", "true");
      localStorage.removeItem("myblog-auth-fails");
      failMemoryRef.count = 0;
      failMemoryRef.until = 0;
      return true;
    }

    // 失敗カウントはメモリのみで増加させる
    failMemoryRef.count = (failMemoryRef.count || 0) + 1;
    if (failMemoryRef.count >= 5) {
      const until = now + 5 * 60_000;
      failMemoryRef.count = 0;
      failMemoryRef.until = until;
      localStorage.setItem("myblog-auth-fails", JSON.stringify({ until }));
    }
    return false;
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

// app/src/context/AuthContext.tsx
import { createContext, useContext, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("myblog-auth") === "true",
  );

  const login = (email: string, password: string) => {
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

    const now = Date.now();
    const failInfoRaw = localStorage.getItem("myblog-auth-fails");
    const failInfo: { count: number; until?: number } = failInfoRaw
      ? JSON.parse(failInfoRaw)
      : { count: 0 };

    // 簡易ロックアウト: 5回失敗で5分ロック
    if (failInfo.until && now < failInfo.until) {
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
      return true;
    }

    const nextCount = (failInfo.count || 0) + 1;
    const next: { count: number; until?: number } =
      nextCount >= 5
        ? { count: 0, until: now + 5 * 60_000 }
        : { count: nextCount };
    localStorage.setItem("myblog-auth-fails", JSON.stringify(next));
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

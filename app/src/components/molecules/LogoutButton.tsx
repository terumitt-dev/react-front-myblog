// src/components/molecules/LogoutButton.tsx
import Button from "@/components/atoms/Button";
import { useAuth } from "@/hooks/useAuth";

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (confirm("ログアウトしますか？")) {
      logout();
    }
  };

  return (
    <Button
      label="ログアウト"
      onClick={handleLogout}
      variant="danger"
      type="button"
    />
  );
};

export default LogoutButton;

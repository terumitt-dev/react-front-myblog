// src/components/molecules/LogoutButton.tsx
import Button from "@/components/atoms/Button";

const LogoutButton = ({ onClick }: { onClick?: () => void }) => (
  <Button label="ログアウト" onClick={onClick} variant="danger" type="button" />
);

export default LogoutButton;

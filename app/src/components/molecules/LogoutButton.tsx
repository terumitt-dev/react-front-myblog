// src/components/molecules/LogoutButton.tsx
import Button from "@/components/atoms/Button";

const LogoutButton = ({ onClick }: { onClick?: () => void }) => {
  const isDisabled = !onClick;
  return (
    <Button
      label="ログアウト"
      onClick={isDisabled ? undefined : onClick}
      variant="danger"
      type="button"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
    />
  );
};

export default LogoutButton;

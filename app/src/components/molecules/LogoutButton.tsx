// src/components/molecules/LogoutButton.tsx
import Button from '@/components/atoms/Button';

const LogoutButton = ({ onLogout }: { onLogout: () => void }) => (
  <Button label="ログアウト" onClick={onLogout} variant="danger" />
);

export default LogoutButton;

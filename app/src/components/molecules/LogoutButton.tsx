// src/components/molecules/LogoutButton.tsx
import Button from '@/components/atoms/Button';

type Props = {
  onClick: () => void
  login?: boolean
}

const LogoutButton = ({ onClick }: Props) => {
  return (
    // biome-ignore lint/a11y/useButtonType: <explanation>
    <button
      onClick={onClick}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
    >
      ログアウト
    </button>
  )
}

export default LogoutButton;

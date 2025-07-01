// src/components/molecules/BackToTopButton.tsx
import { useNavigate } from 'react-router-dom'

const BackToTopButton = () => {
  const navigate = useNavigate()

  return (
    // biome-ignore lint/a11y/useButtonType: <button type>
    <button
      onClick={() => navigate('/')}
      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
    >
      TOPに戻る
    </button>
  )
}

export default BackToTopButton

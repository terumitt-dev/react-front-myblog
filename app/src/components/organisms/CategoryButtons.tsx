// src/components/organisms/CategoryButtons.tsx
import { useNavigate } from 'react-router-dom'

const CategoryButtons = () => {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0' }}>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button onClick={() => navigate('/category/hobby')}>しゅみ</button>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button onClick={() => navigate('/category/tech')}>テック</button>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button onClick={() => navigate('/category/other')}>その他</button>
    </div>
  )
}

export default CategoryButtons

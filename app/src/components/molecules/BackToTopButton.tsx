// src/components/molecules/BackToTopButton.tsx
import { useNavigate } from 'react-router-dom'
import Button from '@/components/atoms/Button'

type Props = {
  className?: string
}

const BackToTopButton = ({ className }: Props) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/')
  }

  return (
    <Button
      label="TOPに戻る"
      onClick={handleClick}
      variant="secondary"
      className={className}
    />
  )
}

export default BackToTopButton

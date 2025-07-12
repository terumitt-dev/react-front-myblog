// src/components/molecules/CommentStartButton.tsx
import Button from '@/components/atoms/Button'

type Props = {
  onClick: () => void
  className?: string
}

const CommentStartButton = ({ onClick, className }: Props) => {
  return (
    <Button
      label="コメントする"
      onClick={onClick}
      variant="primary"
      className={className} // ← ★ 渡す
    />
  )
}

export default CommentStartButton

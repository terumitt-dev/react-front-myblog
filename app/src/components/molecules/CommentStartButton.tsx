// src/components/molecules/CommentStartButton.tsx
import Button from '@/components/atoms/Button'

const CommentStartButton = ({ onClick }: { onClick: () => void }) => (
  <Button label="コメントする" onClick={onClick} variant="primary" className="flex-1" />
)

export default CommentStartButton

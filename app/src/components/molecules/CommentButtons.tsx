// src/components/molecules/CommentButtons.tsx
import Button from '@/components/atoms/Button'

type Props = {
  onSubmit: () => void
  onCancel: () => void
  className?: string
}

const CommentButtons = ({ onSubmit, onCancel }: Props) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button label="コメントを確定する" onClick={onSubmit} variant="primary" className="flex-1"/>
      <Button label="コメントしない" onClick={onCancel} variant="secondary"/>
    </div>
  )
}

export default CommentButtons

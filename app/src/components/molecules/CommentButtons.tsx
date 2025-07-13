// src/components/molecules/CommentButtons.tsx
import Button from '@/components/atoms/Button'

type Props = {
  onSubmit: () => void
  onCancel: () => void
}

const CommentButtons = ({ onSubmit, onCancel }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-end">
      <Button
        label="コメントを確定する"
        onClick={onSubmit}
        variant="primary"
        className="w-full sm:basis-[60%]"
      />
      <Button
        label="コメントしない"
        onClick={onCancel}
        variant="secondary"
        className="w-full sm:basis-[40%]"
      />
    </div>
  )
}

export default CommentButtons

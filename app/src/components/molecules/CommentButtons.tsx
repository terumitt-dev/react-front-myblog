// src/components/molecules/CommentButtons.tsx
import Button from "@/components/atoms/Button";

type Props = {
  onSubmit: () => void;
  onCancel: () => void;
  disabled?: boolean;
};

const CommentButtons = ({ onSubmit, onCancel, disabled = false }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-end">
      <Button
        label="コメントを確定する"
        onClick={onSubmit}
        variant="primary"
        className="w-full sm:basis-[60%]"
        disabled={disabled}
      />
      <Button
        label="コメントしない"
        onClick={onCancel}
        variant="secondary"
        className="w-full sm:basis-[40%]"
        disabled={disabled}
      />
    </div>
  );
};

export default CommentButtons;

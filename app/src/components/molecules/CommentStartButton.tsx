// src/components/molecules/CommentStartButton.tsx
import Button from "@/components/atoms/Button";

type Props = {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

const CommentStartButton = ({
  onClick,
  className = "",
  disabled = false,
}: Props) => {
  return (
    <Button
      label="コメントする"
      onClick={onClick}
      variant="primary"
      className={className}
      type="button"
      disabled={disabled}
    />
  );
};

export default CommentStartButton;

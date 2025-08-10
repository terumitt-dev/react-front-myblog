// src/components/molecules/CommentStartButton.tsx
import Button from "@/components/atoms/Button";

type Props = {
  onClick: () => void;
  className?: string;
};

const CommentStartButton = ({ onClick, className = "" }: Props) => {
  return (
    <Button
      label="コメントする"
      onClick={onClick ?? (() => {})}
      variant="primary"
      className={className}
      type="button"
      disabled={!onClick}
      aria-disabled={!onClick}
    />
  );
};

export default CommentStartButton;

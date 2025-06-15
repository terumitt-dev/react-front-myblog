// src/components/molecules/SubmitCommentButton.tsx
import Button from '@/components/atoms/Button';

const SubmitCommentButton = ({ onSubmit }: { onSubmit: () => void }) => (
  <Button label="コメントを確定する" onClick={onSubmit} variant="primary" />
);

export default SubmitCommentButton;

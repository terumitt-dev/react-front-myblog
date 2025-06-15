// src/components/molecules/CancelButton.tsx
import Button from '@/components/atoms/Button';

const CancelButton = ({ onCancel }: { onCancel: () => void }) => (
  <Button label="コメントしない" onClick={onCancel} variant="secondary" />
);

export default CancelButton;

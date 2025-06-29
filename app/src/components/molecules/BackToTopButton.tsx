// src/components/molecules/BackToTopButton.tsx
import { Link } from 'react-router-dom';
import Button from '@/components/atoms/Button';

const BackToTopButton = () => (
  <Link to="/">
    <Button label="TOPに戻る" />
  </Link>
);

export default BackToTopButton;

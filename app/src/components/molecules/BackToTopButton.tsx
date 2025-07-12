// src/components/molecules/BackToTopButton.tsx
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';

const BackToTopButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return <Button label="TOPに戻る" onClick={handleClick} variant="secondary" />;
};

export default BackToTopButton;

// src/components/molecules/BackToHomeButton.tsx
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";

type Props = {
  className?: string;
};

const BackToHomeButton = ({ className }: Props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/", { replace: true });
  };

  return (
    <Button
      label="TOPに戻る"
      onClick={handleClick}
      variant="secondary"
      className={className}
    />
  );
};

export default BackToHomeButton;

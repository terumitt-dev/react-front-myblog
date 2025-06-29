// src/components/atoms/Button.tsx
type Props = {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
};

const Button = ({ label, onClick, type = 'button', variant = 'primary' }: Props) => {
  const base = "px-4 py-2 rounded";
  const styles = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-500 text-white",
    danger: "bg-red-500 text-white",
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]}`}>
      {label}
    </button>
  );
};

export default Button;

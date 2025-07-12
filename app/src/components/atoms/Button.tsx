// app/src/components/atoms/Button.tsx
type Props = {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

const Button = ({
  label,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
}: Props) => {
  const base = 'px-4 py-2 rounded text-white transition';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;

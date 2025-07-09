// app/src/components/atoms/Button.tsx

type Props = {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset'; // ← 明示可能
};

const Button = ({ label, onClick, variant = 'primary', type = 'button' }: Props) => {
  const base = 'px-4 py-2 rounded text-white transition';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-500 hover:bg-gray-600',
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]}`}>
      {label}
    </button>
  );
};

export default Button;

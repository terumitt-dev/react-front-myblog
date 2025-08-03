// src/components/atoms/Button.tsx
type Props = {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit" | "reset";
  className?: string;
};

const Button = ({
  label,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
}: Props) => {
  const base =
    "block w-auto px-4 py-2 rounded text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500",
    secondary: "bg-gray-500 hover:bg-gray-600 focus-visible:ring-gray-400",
    danger: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;

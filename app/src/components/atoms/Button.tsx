// src/components/atoms/Button.tsx
type Props = {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit" | "reset";
  className?: string;
};

// シンプルなcn関数（shadcn/uiパターンを参考）
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const Button = ({
  label,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
}: Props) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "block w-auto px-4 py-2 rounded text-white transition",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
        variant === "primary" &&
          "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500",
        variant === "secondary" &&
          "bg-gray-500 hover:bg-gray-600 focus-visible:ring-gray-400",
        variant === "danger" &&
          "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500",
        className,
      )}
    >
      {label}
    </button>
  );
};

export default Button;

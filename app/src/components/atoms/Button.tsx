// app/src/components/atoms/Button.tsx
import { cn } from "@/components/utils/cn";
import { UI_COLORS } from "@/components/utils/colors";

type Props = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
};

const Button = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  className,
}: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "block w-auto px-4 py-2 rounded text-white transition-colors",
        "outline-offset-2 focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900",
        "focus-visible:outline-2 focus-visible:outline-blue-500",
        disabled && "opacity-60 cursor-not-allowed",
        variant === "primary" && `${UI_COLORS.blue.bg} ${UI_COLORS.blue.focus}`,
        variant === "secondary" &&
          "bg-gray-500 hover:bg-gray-600 focus-visible:ring-gray-400",
        variant === "danger" && `${UI_COLORS.red.bg} ${UI_COLORS.red.focus}`,
        className,
      )}
      aria-disabled={disabled || undefined}
    >
      {label}
    </button>
  );
};

export default Button;

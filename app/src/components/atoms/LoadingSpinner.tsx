// app/src/components/atoms/LoadingSpinner.tsx
import { cn } from "@/components/utils/cn";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const LoadingSpinner = ({
  size = "md",
  className,
  label = "読み込み中",
}: Props) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400",
          sizeClasses[size],
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;

// app/src/components/molecules/ThemeToggle.tsx
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-full border border-gray-300 dark:border-gray-600"
      aria-label={
        theme === "dark"
          ? "ライトモードに切り替える"
          : "ダークモードに切り替える"
      }
      title={
        theme === "dark"
          ? "ライトモードに切り替える"
          : "ダークモードに切り替える"
      }
    >
      {theme === "dark" ? (
        <Sun className="text-yellow-300" aria-hidden="true" />
      ) : (
        <Moon aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;

// app/src/components/molecules/ThemeToggle.tsx
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-full border border-gray-300 dark:border-gray-600"
    >
      {theme === "dark" ? <Sun className="text-yellow-300" /> : <Moon />}
    </button>
  );
};

export default ThemeToggle;

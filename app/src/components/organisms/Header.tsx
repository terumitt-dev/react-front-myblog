// app/src/components/organisms/Header.tsx
import ThemeToggle from "@/components/molecules/ThemeToggle";

const Header = () => {
  return (
    <header
      className="flex justify-between items-center px-4 py-2"
      aria-label="サイトヘッダー"
    >
      <h1 className="text-xl font-bold">My Blog</h1>
      <ThemeToggle />
    </header>
  );
};

export default Header;

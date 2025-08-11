// app/src/components/layouts/Layout.tsx
import type { ReactNode } from "react";
import Header from "@/components/organisms/Header";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4161EC] to-[#BC7AF2] dark:from-[#1d2a7a] dark:to-[#6b3aa8] text-gray-800 dark:text-gray-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

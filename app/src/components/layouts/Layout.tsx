// app/src/components/layouts/Layout.tsx
import type { ReactNode } from "react";
import Header from "@/components/organisms/Header";
import { CONTAINER_SIZES, RESPONSIVE_SPACING } from "@/constants/responsive";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4161EC] to-[#BC7AF2] dark:from-[#1d2a7a] dark:to-[#6b3aa8] text-gray-800 dark:text-gray-100">
      <Header />
      <main
        className={`${CONTAINER_SIZES.main} ${RESPONSIVE_SPACING.container} py-8`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;

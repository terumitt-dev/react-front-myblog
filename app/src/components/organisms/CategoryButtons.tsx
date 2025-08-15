// app/src/components/organisms/CategoryButtons.tsx
import { Link } from "react-router-dom";
import { CATEGORY_COLORS } from "@/components/utils/colors";
import { cn } from "@/components/utils/cn";

type Props = {
  fullWidth?: boolean;
  className?: string;
};

const CategoryButtons = ({ fullWidth = false, className }: Props) => {
  return (
    <div className={cn("flex gap-4", fullWidth ? "w-full" : "", className)}>
      {/* しゅみ */}
      <Link
        to="/category/hobby"
        className={cn(
          "py-2 rounded text-black shadow hover:opacity-90 transition-colors text-center block",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          fullWidth ? "flex-1" : "px-6",
          CATEGORY_COLORS.hobby.bg,
          CATEGORY_COLORS.hobby.focusRing,
        )}
        aria-label="趣味カテゴリーに移動"
      >
        {CATEGORY_COLORS.hobby.name}
      </Link>

      {/* テック */}
      <Link
        to="/category/tech"
        className={cn(
          "py-2 rounded text-black shadow hover:opacity-90 transition-colors text-center block",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          fullWidth ? "flex-1" : "px-6",
          CATEGORY_COLORS.tech.bg,
          CATEGORY_COLORS.tech.focusRing,
        )}
        aria-label="テックカテゴリーに移動"
      >
        {CATEGORY_COLORS.tech.name}
      </Link>

      {/* その他 */}
      <Link
        to="/category/other"
        className={cn(
          "py-2 rounded text-black shadow hover:opacity-90 transition-colors text-center block",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          fullWidth ? "flex-1" : "px-6",
          CATEGORY_COLORS.other.bg,
          CATEGORY_COLORS.other.focusRing,
        )}
        aria-label="その他カテゴリーに移動"
      >
        {CATEGORY_COLORS.other.name}
      </Link>
    </div>
  );
};

export default CategoryButtons;

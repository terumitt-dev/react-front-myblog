// src/components/organisms/CategoryButtons.tsx
import { useNavigate } from "react-router-dom";
import { CATEGORY_COLORS } from "../utils/colors";

type Props = {
  /** true のとき親要素の幅いっぱいに押し広げる */
  fullWidth?: boolean;
};

// シンプルなcn関数（shadcn/uiパターンを参考）
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const CategoryButtons = ({ fullWidth = false }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex gap-x-4",
        fullWidth ? "justify-between w-full" : "justify-center",
      )}
    >
      {/* しゅみ */}
      <button
        type="button"
        onClick={() => navigate("/category/hobby")}
        className={cn(
          "py-2 rounded text-black shadow hover:opacity-90 transition",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          fullWidth ? "flex-1" : "px-6",
          CATEGORY_COLORS.hobby.bg,
          CATEGORY_COLORS.hobby.focusRing,
        )}
        aria-label="趣味カテゴリーに移動"
      >
        {CATEGORY_COLORS.hobby.name}
      </button>

      {/* テック */}
      <button
        type="button"
        onClick={() => navigate("/category/tech")}
        className={cn(
          "py-2 rounded text-black shadow hover:opacity-90 transition",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          fullWidth ? "flex-1" : "px-6",
          CATEGORY_COLORS.tech.bg,
          CATEGORY_COLORS.tech.focusRing,
        )}
        aria-label="テックカテゴリーに移動"
      >
        {CATEGORY_COLORS.tech.name}
      </button>

      {/* その他 */}
      <button
        type="button"
        onClick={() => navigate("/category/other")}
        className={cn(
          "py-2 rounded text-black shadow hover:opacity-90 transition",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          fullWidth ? "flex-1" : "px-6",
          CATEGORY_COLORS.other.bg,
          CATEGORY_COLORS.other.focusRing,
        )}
        aria-label="その他カテゴリーに移動"
      >
        {CATEGORY_COLORS.other.name}
      </button>
    </div>
  );
};

export default CategoryButtons;

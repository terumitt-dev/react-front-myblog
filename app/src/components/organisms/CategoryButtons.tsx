// src/components/organisms/CategoryButtons.tsx
import { useNavigate } from "react-router-dom";

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
          fullWidth ? "flex-1" : "px-6",
          "bg-[#E1C6F9]",
        )}
      >
        しゅみ
      </button>

      {/* テック */}
      <button
        type="button"
        onClick={() => navigate("/category/tech")}
        className={cn(
          "py-2 rounded text-black shadow hover:opacity-90 transition",
          fullWidth ? "flex-1" : "px-6",
          "bg-[#AFEBFF]",
        )}
      >
        テック
      </button>

      {/* その他 */}
      <button
        type="button"
        onClick={() => navigate("/category/other")}
        className={cn(
          "py-2 rounded text-black shadow hover:opacity-90 transition",
          fullWidth ? "flex-1" : "px-6",
          "bg-[#CCF5B1]",
        )}
      >
        その他
      </button>
    </div>
  );
};

export default CategoryButtons;

// src/components/organisms/CategoryButtons.tsx
import { useNavigate } from "react-router-dom";

type Props = {
  /** true のとき親要素の幅いっぱいに押し広げる */
  fullWidth?: boolean;
};

const CategoryButtons = ({ fullWidth = false }: Props) => {
  const navigate = useNavigate();

  // ラッパーのスタイル：fullWidth なら justify-between + w-full
  const wrapperClass = fullWidth
    ? "flex justify-between w-full gap-x-4"
    : "flex justify-center gap-x-4";

  // ボタン共通クラス
  const btnBase = "py-2 rounded text-black shadow hover:opacity-90 transition";

  // fullWidth の時だけ flex-1 で横幅均等に
  const grow = fullWidth ? "flex-1" : "px-6";

  return (
    <div className={wrapperClass}>
      {/* しゅみ */}
      <button
        type="button"
        onClick={() => navigate("/category/hobby")}
        className={`${btnBase} ${grow} bg-[#E1C6F9]`}
      >
        しゅみ
      </button>

      {/* テック */}
      <button
        type="button"
        onClick={() => navigate("/category/tech")}
        className={`${btnBase} ${grow} bg-[#AFEBFF]`}
      >
        テック
      </button>

      {/* その他 */}
      <button
        type="button"
        onClick={() => navigate("/category/other")}
        className={`${btnBase} ${grow} bg-[#CCF5B1]`}
      >
        その他
      </button>
    </div>
  );
};

export default CategoryButtons;

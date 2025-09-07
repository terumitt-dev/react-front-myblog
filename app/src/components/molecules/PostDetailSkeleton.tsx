// app/src/components/molecules/PostDetailSkeleton.tsx
import Skeleton from "@/components/atoms/Skeleton";
import { cn } from "@/components/utils/cn";

type Props = {
  className?: string;
};

const PostDetailSkeleton = ({ className }: Props) => {
  return (
    <main
      role="main"
      className={cn(
        "bg-gray-100 dark:bg-gray-800 w-full rounded-xl overflow-hidden py-8",
        LAYOUT_PATTERNS.mainContainer,
        className,
      )}
      aria-label="記事を読み込み中"
    >
      {/* 2カラムレイアウト */}
      <div
        className={cn(
          "grid",
          "grid-cols-1 md:grid-cols-3",
          RESPONSIVE_SPACING.gap,
        )}
      >
        {/* 記事エリアのスケルトン */}
        <article
          className={cn(
            "w-full bg-white dark:bg-gray-700 rounded-xl shadow p-6 space-y-6",
            "md:col-span-2",
          )}
          aria-label="記事内容を読み込み中"
        >
          {/* ヘッダー部分 */}
          <header className="space-y-4">
            {/* タイトル */}
            <Skeleton variant="text" height="2.5rem" width="85%" />
            {/* カテゴリ */}
            <Skeleton
              variant="rectangular"
              height="2rem"
              width="25%"
              className="rounded"
            />
            {/* 区切り線 */}
            <div className="mt-4 border-t border-gray-300 dark:border-gray-600" />
          </header>

          {/* 記事本文 */}
          <div className="pt-2">
            <Skeleton variant="text" lines={12} />
          </div>
        </article>

        {/* コメント一覧のスケルトン */}
        <aside
          className={cn(
            "w-full bg-white dark:bg-gray-700 rounded-xl shadow p-6 space-y-4",
          )}
          aria-label="コメント一覧を読み込み中"
          role="complementary"
        >
          {/* コメント見出し */}
          <Skeleton variant="text" height="1.75rem" width="65%" />

          {/* コメントリスト */}
          <div className="space-y-3" role="list">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-600 p-4 rounded shadow-sm space-y-2"
                role="listitem"
              >
                {/* ユーザー名 */}
                <Skeleton variant="text" height="1rem" width="35%" />
                {/* コメント内容 */}
                <Skeleton variant="text" lines={2} />
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ボタン列のスケルトン */}
      <nav
        className={cn(
          RESPONSIVE_FLEX.columnToRow,
          RESPONSIVE_SPACING.gapSmall,
          "mt-8",
        )}
        aria-label="記事関連アクション（読み込み中）"
      >
        <Skeleton
          variant="rectangular"
          height="3rem"
          className="w-full sm:basis-[60%] rounded"
        />
        <Skeleton
          variant="rectangular"
          height="3rem"
          className="w-full sm:basis-[40%] rounded"
        />
      </nav>
    </main>
  );
};

export default PostDetailSkeleton;

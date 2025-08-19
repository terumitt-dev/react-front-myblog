// app/src/pages/Top.tsx
import Layout from "@/components/layouts/Layout";
import { Link } from "react-router-dom";
import CategoryButtons from "@/components/organisms/CategoryButtons";
import ArticleSkeleton from "@/components/molecules/ArticleSkeleton";
import { displayTextPlain } from "@/components/utils/sanitizer";
import { usePosts } from "@/hooks/usePosts";
import {
  LAYOUT_PATTERNS,
  RESPONSIVE_SPACING,
  RESPONSIVE_GRID,
  RESPONSIVE_TEXT,
} from "@/constants/responsive";

const Top = () => {
  // usePostsフックを使用（categoryを未指定で全投稿取得）
  const { posts, isLoading } = usePosts(undefined);

  // 投稿日時でソートして最新6件を取得
  const latestArticles = posts
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // 新しい順
    })
    .slice(0, 6);

  return (
    <Layout>
      <main
        className={`${LAYOUT_PATTERNS.sectionContainer} space-y-8`}
        role="main"
        aria-labelledby="page-title"
      >
        {/* メインタイトル（スクリーンリーダー用） */}
        <h1 id="page-title" className="sr-only">
          My Blog - ホームページ
        </h1>

        {/* ヒーロー画像 */}
        <section aria-label="ブログのメインビジュアル">
          <div className="w-full overflow-hidden rounded-xl">
            <img
              src="/top.svg"
              alt="このブログのイメージを表すトップ画像"
              className="w-full h-auto object-cover"
            />
          </div>
        </section>

        {/* カテゴリナビゲーション */}
        <nav aria-label="記事カテゴリー" className="space-y-3">
          <h2 className="sr-only">カテゴリー一覧</h2>
          <CategoryButtons fullWidth />
        </nav>

        {/* 最新記事セクション */}
        <section
          className="space-y-4"
          aria-labelledby="latest-articles-heading"
        >
          <div
            className={`bg-gray-200 dark:bg-gray-800 rounded-xl ${RESPONSIVE_SPACING.section} overflow-hidden`}
          >
            <h2
              id="latest-articles-heading"
              className={`${RESPONSIVE_TEXT.heading2} font-semibold text-center mb-4 text-gray-900 dark:text-white`}
            >
              最新記事
            </h2>

            {isLoading ? (
              <ArticleSkeleton count={6} />
            ) : latestArticles.length === 0 ? (
              <p
                className="text-center text-gray-500 dark:text-gray-400"
                role="status"
                aria-live="polite"
              >
                まだ投稿がありません。
              </p>
            ) : (
              <div
                className={`grid ${RESPONSIVE_GRID.articles} gap-6 w-full`}
                role="list"
                aria-label="最新記事一覧"
              >
                {latestArticles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow p-4 flex flex-col justify-between w-full min-w-0"
                    role="listitem"
                  >
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white break-words">
                        {/* 安全な表示 */}
                        {displayTextPlain(article.title)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                        カテゴリー: {displayTextPlain(article.category)}
                      </p>
                    </div>
                    <Link
                      to={`/posts/${article.id}`}
                      className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline self-start focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition"
                      aria-label={`記事「${article.title}」を読む`}
                    >
                      記事を読む →
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Top;

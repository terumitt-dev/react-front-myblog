// app/src/pages/Top.tsx
import Layout from "@/components/layouts/Layout";
import { Link } from "react-router-dom";
import CategoryButtons from "@/components/organisms/CategoryButtons";
import ArticleSkeleton from "@/components/molecules/ArticleSkeleton";
import { displayTextPlain } from "@/components/utils/sanitizer";
import { usePosts } from "@/hooks/usePosts";
import Container from "@/components/layouts/Container";
import { cn } from "@/components/utils/cn";

const Top = () => {
  // usePostsフック（MSWからデータ取得）
  const { posts, isLoading, error } = usePosts();

  // 投稿日時でソートして最新6件を取得
  const latestArticles = posts
    .filter((post) => post.published) // 公開済みのみ
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA; // 新しい順
    })
    .slice(0, 6);

  return (
    <Layout>
      <Container
        as="main"
        className="space-y-8"
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
            className={cn(
              "bg-gray-200 dark:bg-gray-800 rounded-xl",
              "p-4 sm:p-6",
              "overflow-hidden",
            )}
          >
            <h2
              id="latest-articles-heading"
              className={cn(
                "text-xl sm:text-2xl lg:text-3xl",
                "font-semibold text-center mb-4 text-gray-900 dark:text-white",
              )}
            >
              最新記事
            </h2>

            {error ? (
              <div
                className="text-center text-red-500 dark:text-red-400 p-4"
                role="alert"
                aria-live="assertive"
              >
                <p>記事の読み込みに失敗しました。</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            ) : isLoading ? (
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
                className={cn(
                  "grid",
                  "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
                  "gap-6 w-full",
                )}
                role="list"
                aria-label="最新記事一覧"
              >
                {latestArticles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow p-4 flex flex-col justify-between w-full min-w-0"
                    role="listitem"
                  >
                    {/* 記事画像 */}
                    {article.featuredImage && (
                      <div className="mb-3 overflow-hidden rounded-lg">
                        <img
                          src={article.featuredImage}
                          alt={`${article.title}のサムネイル`}
                          className="w-full h-32 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white break-words mb-2">
                        {displayTextPlain(article.title)}
                      </h3>

                      {article.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 break-words">
                          {displayTextPlain(article.excerpt)}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          {displayTextPlain(article.category_name)}
                        </span>
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                          >
                            #{displayTextPlain(tag)}
                          </span>
                        ))}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <p>by {displayTextPlain(article.author)}</p>
                        <p>
                          {new Date(
                            article.publishedAt || article.createdAt,
                          ).toLocaleDateString("ja-JP")}
                        </p>
                        {article.commentsCount > 0 && (
                          <p>{article.commentsCount}件のコメント</p>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/posts/${article.id}`}
                      className="mt-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline self-start focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition"
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
      </Container>
    </Layout>
  );
};

export default Top;

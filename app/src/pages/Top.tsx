// app/src/pages/Top.tsx
import Layout from "@/components/layouts/Layout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryButtons from "@/components/organisms/CategoryButtons";
import {
  LAYOUT_PATTERNS,
  RESPONSIVE_SPACING,
  RESPONSIVE_GRID,
  RESPONSIVE_TEXT,
} from "@/constants/responsive";

type Post = {
  id: number;
  title: string;
  category: string;
};

const Top = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("myblog-posts");
    if (saved) {
      try {
        const normalized = (JSON.parse(saved) as Post[]).map((p) => ({
          ...p,
          id: Number(p.id),
        }));
        setPosts(normalized);
      } catch (error) {
        console.error("Posts loading error:", error);
        setPosts([]);
      }
    }
  }, []);

  const latestArticles = posts.slice(-3).reverse();

  return (
    <Layout>
      <div className={`${LAYOUT_PATTERNS.sectionContainer} space-y-8`}>
        {/* ヒーロー画像 */}
        <div className="w-full overflow-hidden rounded-xl">
          <img
            src="/top.svg"
            alt="このブログのイメージを表すトップ画像"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* カテゴリボタン */}
        <section className="space-y-3">
          <CategoryButtons fullWidth />
        </section>

        {/* 最新記事 */}
        <section className="space-y-4">
          <div
            className={`bg-gray-200 dark:bg-gray-800 rounded-xl ${RESPONSIVE_SPACING.section} overflow-hidden`}
          >
            <h2
              className={`${RESPONSIVE_TEXT.heading2} font-semibold text-center mb-4 text-gray-900 dark:text-white`}
            >
              最新記事
            </h2>

            {latestArticles.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                まだ投稿がありません。
              </p>
            ) : (
              <div className={`grid ${RESPONSIVE_GRID.articles} gap-6 w-full`}>
                {latestArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow p-4 flex flex-col justify-between w-full min-w-0"
                  >
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white break-words">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                        カテゴリー: {article.category}
                      </p>
                    </div>
                    <Link
                      to={`/posts/${article.id}`}
                      className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline self-start focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition"
                    >
                      記事を読む →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Top;

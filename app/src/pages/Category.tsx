// app/src/pages/Category.tsx
import { useCallback, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/organisms/Header";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import {
  displayTextSafe,
  displayTextPlain,
} from "@/components/utils/sanitizer";
import { CATEGORY_COLORS } from "@/components/utils/colors";
import { useStaticEffects } from "@/hooks/useStaticEffects";
import { useBubbleGeneration } from "@/hooks/useBubbleGeneration";
import "@/pages/Category.css";

// シンプルなcn関数
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const Category = () => {
  const { category } = useParams<{ category: string }>();

  // Page Visibility監視
  const [isPageVisible, setIsPageVisible] = useState(() => {
    if (typeof document === "undefined") return true;
    return !document.hidden;
  });

  // カスタムフック使用
  const {
    posts,
    spiders,
    snails,
    reducedMotion,
    spiderDisappearingIds,
    snailDisappearingIds,
    handleSpiderClick,
    handleSnailClick,
    handleSnailHover,
    isValidCategory,
  } = useStaticEffects(category);

  const { bubbles, handleBubbleEnd, initializeBubbles } = useBubbleGeneration({
    category,
    reducedMotion,
    isPageVisible,
  });

  // Page Visibility監視
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // バブル初期化
  useEffect(() => {
    initializeBubbles();
  }, [initializeBubbles]);

  // スパイダーレイヤー
  const renderSpiderLayer = useCallback(() => {
    if (category !== "hobby" || spiders.length === 0) return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {spiders.map((spider) => (
          <button
            key={spider.id}
            type="button"
            onClick={() => handleSpiderClick(spider.id)}
            aria-label="蜘蛛を消す"
            className={cn(
              "spider pointer-events-auto",
              spiderDisappearingIds.has(spider.id) && "spider-disappear",
            )}
            style={
              {
                top: spider.top,
                left: spider.left,
                position: "absolute",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                "--rotation": `${spider.rotate}deg`,
              } as React.CSSProperties & { "--rotation": string }
            }
          >
            <span className="spider-rotator">
              <img
                src="/patterns/spider.svg"
                alt=""
                role="presentation"
                draggable={false}
                style={{ pointerEvents: "none", width: "50px", height: "50px" }}
              />
            </span>
          </button>
        ))}
      </div>
    );
  }, [category, spiders, spiderDisappearingIds, handleSpiderClick]);

  // バブルレイヤー
  const renderBubbleLayer = useCallback(() => {
    if (category !== "tech" || bubbles.length === 0) return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {bubbles.map((bubble) => (
          <img
            key={bubble.id}
            src="/patterns/bubbles.svg"
            alt=""
            role="presentation"
            draggable={false}
            className="bubble"
            style={{
              top: bubble.top,
              left: bubble.left,
              position: "absolute",
              width: "50px",
              height: "50px",
            }}
            onAnimationEnd={() => handleBubbleEnd(bubble.id)}
          />
        ))}
      </div>
    );
  }, [category, bubbles, handleBubbleEnd]);

  // カタツムリレイヤー
  const renderSnailLayer = useCallback(() => {
    if (category !== "other" || snails.length === 0) return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {snails.map((snail) => (
          <button
            key={snail.id}
            type="button"
            onClick={() => handleSnailClick(snail.id)}
            onMouseEnter={() => handleSnailHover(snail.id)}
            aria-label="カタツムリを消す"
            className={cn(
              "snail pointer-events-auto",
              snail.isMoved && "snail-move",
              snailDisappearingIds.has(snail.id) && "snail-disappear",
            )}
            style={{
              top: snail.top,
              left: snail.left,
              position: "absolute",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <img
              src="/patterns/snail.svg"
              alt=""
              role="presentation"
              draggable={false}
              style={{ pointerEvents: "none", width: "60px", height: "60px" }}
            />
          </button>
        ))}
      </div>
    );
  }, [
    category,
    snails,
    snailDisappearingIds,
    handleSnailClick,
    handleSnailHover,
  ]);

  // カテゴリバリデーション
  if (!isValidCategory(category)) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            無効なカテゴリです
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            有効なカテゴリ: hobby, tech, other
          </p>
          <BackToHomeButton className="mt-4" />
        </div>
      </div>
    );
  }

  const categoryConfig = CATEGORY_COLORS[category];

  return (
    <div
      className={cn("min-h-screen relative overflow-hidden", categoryConfig.bg)}
    >
      <Header />

      {/* エフェクトレイヤー */}
      {renderSpiderLayer()}
      {renderBubbleLayer()}
      {renderSnailLayer()}

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            {categoryConfig.name}のページ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {posts.length > 0
              ? `${posts.length}件の投稿があります`
              : "まだ投稿がありません"}
          </p>
          <BackToHomeButton />
        </div>

        {/* 投稿一覧 */}
        {posts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold break-words mb-2 text-gray-900 dark:text-white">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: displayTextSafe(post.title),
                      }}
                    />
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 break-words">
                    {displayTextPlain(post.content).slice(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : "日付不明"}
                    </span>
                    <Link
                      to={`/posts/${post.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition"
                    >
                      読む →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Category;

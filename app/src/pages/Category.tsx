// app/src/pages/Category.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import "./Category.css";
import Header from "@/components/organisms/Header";
import { useInterval } from "@/hooks/useInterval";
import { usePerformanceSettings } from "@/hooks/usePerformanceSettings";
import { useAnimationEffects } from "@/hooks/useAnimationEffects";

type Post = { id: number; title: string; content: string; category: string };
type CategoryType = "hobby" | "tech" | "other";

// 定数を外部定義
const ROTATION_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;
const CATEGORY_CONFIG = {
  labelMap: { hobby: "しゅみ", tech: "テック", other: "その他" } as const,
  bgMap: {
    hobby: "bg-[#E1C6F9]",
    tech: "bg-[#AFEBFF]",
    other: "bg-[#CCF5B1]",
  } as const,
} as const;

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // カスタムフック使用
  const { performanceSettings } = usePerformanceSettings();
  const effects = useAnimationEffects(performanceSettings.reducedAnimations);

  // ヘルパー関数
  const isValidCategory = useCallback(
    (cat: string | undefined): cat is CategoryType =>
      cat === "hobby" || cat === "tech" || cat === "other",
    [],
  );

  // ヘルパー関数をuseRefで安定化
  const generateRandomPositionRef = useRef(
    (maxTop: number, maxLeft: number) => ({
      top: `${Math.random() * maxTop + 10}%`,
      left: `${Math.random() * maxLeft + 10}%`,
    }),
  );

  const generateRandomRotationRef = useRef(() => {
    const randomIndex = Math.floor(Math.random() * ROTATION_ANGLES.length);
    return ROTATION_ANGLES[randomIndex];
  });

  // reduced-motion監視
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener?.(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener?.(handleChange);
      }
    };
  }, []);

  // 初期化効果 - 最小限の依存配列でシンプルに
  useEffect(() => {
    // 投稿読み込み
    const saved = localStorage.getItem("myblog-posts");
    if (saved) {
      try {
        const all: Post[] = JSON.parse(saved);
        setPosts(all.filter((p) => p.category === category));
      } catch (e) {
        console.error("JSON parse error:", e);
        localStorage.removeItem("myblog-posts");
      }
    }

    if (!isValidCategory(category) || !performanceSettings.enableEffects) {
      effects.clearSpiders();
      effects.clearBubbles();
      effects.clearSnails();
      return;
    }

    // エフェクト初期化
    if (category === "hobby") {
      const spiderCount = reducedMotion
        ? Math.ceil(performanceSettings.maxSpiders / 2)
        : performanceSettings.maxSpiders;
      effects.initializeSpiders(
        spiderCount,
        generateRandomPositionRef.current,
        generateRandomRotationRef.current,
      );
    } else {
      effects.clearSpiders();
    }

    if (category !== "tech") effects.clearBubbles();

    if (category === "other") {
      const snailCount = reducedMotion
        ? Math.ceil(performanceSettings.maxSnails / 2)
        : performanceSettings.maxSnails;
      effects.initializeSnails(snailCount, generateRandomPositionRef.current);
    } else {
      effects.clearSnails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    reducedMotion,
    performanceSettings.maxSpiders,
    performanceSettings.maxSnails,
    performanceSettings.enableEffects,
    // effectsとisValidCategoryは含めない（安定した参照のため）
  ]);

  // バブル生成 - effectsを依存配列から除外
  const generateBubble = useCallback(() => {
    if (
      reducedMotion ||
      !performanceSettings.enableEffects ||
      !performanceSettings.enableAnimations
    )
      return;
    effects.generateBubble(
      performanceSettings.maxBubbles,
      generateRandomPositionRef.current,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reducedMotion,
    performanceSettings.maxBubbles,
    performanceSettings.enableEffects,
    performanceSettings.enableAnimations,
    // effects.generateBubbleは含めない（安定した参照のため）
  ]);

  // useInterval
  const shouldGenerateBubbles =
    category === "tech" &&
    performanceSettings.enableEffects &&
    performanceSettings.enableAnimations &&
    !reducedMotion;

  useInterval(
    generateBubble,
    shouldGenerateBubbles ? performanceSettings.bubbleInterval : null,
    [
      category,
      shouldGenerateBubbles,
      performanceSettings.maxBubbles,
      performanceSettings.bubbleInterval,
      performanceSettings.enableEffects,
      performanceSettings.enableAnimations,
      reducedMotion,
    ],
  );

  // 表示用の値をメモ化
  const displayValues = useMemo(() => {
    const validCategory = isValidCategory(category);
    return {
      currentLabel: validCategory
        ? CATEGORY_CONFIG.labelMap[category]
        : category,
      currentBg: validCategory ? CATEGORY_CONFIG.bgMap[category] : "bg-white",
    };
  }, [category, isValidCategory]);

  return (
    <section
      className={`relative min-h-screen p-6 space-y-6 overflow-hidden ${displayValues.currentBg}`}
    >
      <Header />

      {/* 背景レイヤー */}
      {/* スパイダーレイヤー */}
      {category === "hobby" &&
        effects.spiderVisible &&
        effects.spiders.length > 0 &&
        performanceSettings.enableEffects && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {effects.spiders.map((spider) => (
              <button
                key={spider.id}
                type="button"
                onClick={() => effects.handleSpiderClick(spider.id)}
                aria-label="クモを消す"
                className={`spider pointer-events-auto rotate-${spider.rotate} ${
                  effects.spiderDisappearingIds.includes(spider.id)
                    ? "spider-disappear"
                    : ""
                } ${performanceSettings.reducedAnimations ? "performance-reduced" : ""}`}
                style={{
                  top: spider.top,
                  left: spider.left,
                  position: "absolute",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img
                  src="/patterns/spider.svg"
                  alt=""
                  draggable={false}
                  style={{ pointerEvents: "none" }}
                />
              </button>
            ))}
          </div>
        )}

      {/* バブルレイヤー */}
      {category === "tech" &&
        effects.bubbles.length > 0 &&
        performanceSettings.enableEffects && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {effects.bubbles.map((bubble) => (
              <img
                key={bubble.id}
                src="/patterns/bubbles.svg"
                alt=""
                className={`bubble ${performanceSettings.reducedAnimations ? "performance-reduced" : ""}`}
                style={{
                  top: bubble.top,
                  left: bubble.left,
                  animationDuration:
                    reducedMotion || !performanceSettings.enableAnimations
                      ? "0s"
                      : undefined,
                }}
                onAnimationEnd={() => effects.handleBubbleEnd(bubble.id)}
              />
            ))}
          </div>
        )}

      {/* カタツムリレイヤー */}
      {category === "other" &&
        effects.snails.length > 0 &&
        performanceSettings.enableEffects && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {effects.snails.map((snail) => (
              <button
                key={snail.id}
                type="button"
                aria-label="カタツムリを削除"
                className={`snail pointer-events-auto ${snail.isMoved ? "snail-move" : ""} ${
                  effects.snailDisappearingIds.includes(snail.id)
                    ? "snail-disappear"
                    : ""
                } ${performanceSettings.reducedAnimations ? "performance-reduced" : ""}`}
                style={{
                  top: snail.top,
                  left: snail.left,
                  position: "absolute",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
                onClick={() => effects.handleSnailClick(snail.id)}
                onMouseEnter={() =>
                  effects.handleSnailHover(
                    snail.id,
                    performanceSettings.enableAnimations,
                  )
                }
              >
                <img
                  src="/patterns/snail.svg"
                  alt=""
                  draggable={false}
                  style={{ pointerEvents: "none" }}
                />
              </button>
            ))}
          </div>
        )}

      {/* コンテンツ */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold">
          {displayValues.currentLabel} カテゴリの記事
        </h1>

        {posts.length === 0 ? (
          <p>このカテゴリにはまだ投稿がありません。</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition w-full"
              >
                <h2 className="text-xl font-semibold break-words">
                  {post.title}
                </h2>
                <p className="text-gray-700 mt-2 break-words">
                  {post.content.slice(0, 100)}...
                </p>
                <Link
                  to={`/posts/${post.id}`}
                  className="mt-3 inline-block text-blue-600 hover:underline"
                >
                  詳細を見る →
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="w-full pt-6">
          <BackToHomeButton className="w-full" />
        </div>
      </div>
    </section>
  );
};

export default Category;

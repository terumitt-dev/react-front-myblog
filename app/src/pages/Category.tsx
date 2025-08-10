// app/src/pages/Category.tsx
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/organisms/Header";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import { useInterval } from "@/hooks/useInterval";
import { useTimers } from "@/hooks/useTimers";
import "./Category.css";

// シンプルなcn関数（shadcn/uiパターンを参考）
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
};
type Spider = { id: number; top: string; left: string; rotate: number };
type Bubble = { id: number; top: string; left: string; createdAt: number };
type Snail = { id: number; top: string; left: string; isMoved: boolean };

type CategoryType = "hobby" | "tech" | "other";

type PerformanceSettings = {
  maxSpiders: number;
  maxBubbles: number;
  maxSnails: number;
  bubbleInterval: number;
  enableEffects: boolean;
  enableAnimations: boolean;
  reducedAnimations: boolean;
};

const createPerformanceSettings = (
  maxSpiders = 3,
  maxBubbles = 5,
  maxSnails = 4,
  bubbleInterval = 3000,
  enableEffects = true,
  enableAnimations = true,
  reducedAnimations = false,
): PerformanceSettings => ({
  maxSpiders,
  maxBubbles,
  maxSnails,
  bubbleInterval,
  enableEffects,
  enableAnimations,
  reducedAnimations,
});

const getPerformanceSettings = (screenWidth: number): PerformanceSettings => {
  if (screenWidth < 768) {
    return createPerformanceSettings(1, 2, 1, 4000, true, true, true);
  } else if (screenWidth < 1024) {
    return createPerformanceSettings(2, 3, 2, 3500, true, true, false);
  } else if (screenWidth < 1280) {
    return createPerformanceSettings(3, 4, 3, 3000, true, true, false);
  } else {
    return createPerformanceSettings(4, 6, 4, 2500, true, true, false);
  }
};

// 定数を外部定義
const ROTATION_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;
const CATEGORY_CONFIG = {
  labelMap: { hobby: "しゅみ", tech: "テック", other: "その他" } as const,
  bgMap: {
    hobby: "bg-[#E1C6F9]",
    tech: "bg-[#C6E2FF]",
    other: "bg-[#FFE5B4]",
  } as const,
} as const;

const getDisappearDuration = (reducedAnimations: boolean) =>
  reducedAnimations ? 150 : 300;

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [spiderDisappearingIds, setSpiderDisappearingIds] = useState<number[]>(
    [],
  );
  const [snailDisappearingIds, setSnailDisappearingIds] = useState<number[]>(
    [],
  );
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [snails, setSnails] = useState<Snail[]>([]);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // 画面幅の監視（デバウンス付き）
  const [screenWidth, setScreenWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const resizeTimeoutRef = useRef<number | null>(null);

  // Page Visibility API で画面外時のパフォーマンス制御
  const [isPageVisible, setIsPageVisible] = useState(() => {
    if (typeof document === "undefined") return true;
    return !document.hidden;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);

      // 画面外になった時の即座清理
      if (document.hidden) {
        // エフェクトを即座に停止（オプション）
        console.debug("Page hidden: パフォーマンス最適化モードに切り替え");
      } else {
        console.debug("Page visible: 通常モードに復帰");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // デバウンス付きリサイズハンドラー
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        setScreenWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, []);

  // パフォーマンス設定に画面可視性を組み込み
  const enhancedPerformanceSettings = useMemo(() => {
    const baseSettings = getPerformanceSettings(screenWidth);

    // 画面外では全てのエフェクトを無効化（大幅なパフォーマンス向上）
    if (!isPageVisible) {
      return {
        ...baseSettings,
        enableEffects: false,
        enableAnimations: false,
        maxSpiders: 0,
        maxBubbles: 0,
        maxSnails: 0,
        bubbleInterval: Number.MAX_SAFE_INTEGER, // バブル生成停止
      };
    }

    return baseSettings;
  }, [screenWidth, isPageVisible]);

  // 安定化されたヘルパー関数
  const { setTimeout } = useTimers();
  const bubbleIdCounterRef = useRef(0);

  // 純粋関数として定義（依存なし）
  const isValidCategory = useCallback(
    (cat: string | undefined): cat is CategoryType =>
      cat === "hobby" || cat === "tech" || cat === "other",
    [],
  );

  const generateRandomPosition = useCallback(
    (containerWidth: number, containerHeight: number, elSize = 60) => {
      const margin = elSize; // 要素サイズ分の余白
      const maxLeftPx = Math.max(0, containerWidth - margin);
      const maxTopPx = Math.max(0, containerHeight - margin);

      const leftPx = Math.random() * maxLeftPx;
      const topPx = Math.random() * maxTopPx;

      return { top: `${topPx}px`, left: `${leftPx}px` };
    },
    [],
  );

  const generateRandomRotation = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * ROTATION_ANGLES.length);
    return ROTATION_ANGLES[randomIndex];
  }, []);

  // reduced-motion監視
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(e.matches);
    };

    // 初期同期
    setReducedMotion(mediaQuery.matches);

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

  // 初期化効果
  useEffect(() => {
    // 投稿読み込み
    const saved = localStorage.getItem("myblog-posts");
    if (saved) {
      try {
        const all: Post[] = JSON.parse(saved);
        if (isValidCategory(category)) {
          setPosts(all.filter((p) => p.category === category));
        } else {
          setPosts([]);
          return; // 不正カテゴリ時は以降のエフェクト初期化をスキップ
        }
      } catch (e) {
        console.error("JSON parse error:", e);
        localStorage.removeItem("myblog-posts");
      }
    }

    if (
      !isValidCategory(category) ||
      !enhancedPerformanceSettings.enableEffects
    ) {
      setSpiders([]);
      setBubbles([]);
      setSnails([]);
      return;
    }

    // 画面サイズを取得
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    // エフェクト初期化
    if (category === "hobby") {
      const spiderCount = reducedMotion
        ? Math.ceil(enhancedPerformanceSettings.maxSpiders / 2)
        : enhancedPerformanceSettings.maxSpiders;

      setSpiders(
        Array.from({ length: spiderCount }, (_, i) => ({
          id: i,
          ...generateRandomPosition(containerWidth, containerHeight, 50),
          rotate: generateRandomRotation(),
        })),
      );
    } else {
      setSpiders([]);
    }

    if (category !== "tech") setBubbles([]);

    if (category === "other") {
      const snailCount = reducedMotion
        ? Math.ceil(enhancedPerformanceSettings.maxSnails / 2)
        : enhancedPerformanceSettings.maxSnails;

      setSnails(
        Array.from({ length: snailCount }, (_, i) => ({
          id: i,
          ...generateRandomPosition(containerWidth, containerHeight, 60),
          isMoved: false,
        })),
      );
    } else {
      setSnails([]);
    }
  }, [
    category,
    reducedMotion,
    enhancedPerformanceSettings.maxSpiders,
    enhancedPerformanceSettings.maxSnails,
    enhancedPerformanceSettings.enableEffects,
    isValidCategory,
    generateRandomPosition,
    generateRandomRotation,
  ]);

  // バブル生成（安定化）
  const generateBubble = useCallback(() => {
    if (
      typeof window === "undefined" ||
      reducedMotion ||
      !enhancedPerformanceSettings.enableEffects ||
      !enhancedPerformanceSettings.enableAnimations ||
      !isPageVisible // 画面外では生成停止
    ) {
      return;
    }

    setBubbles((prev) => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      const newBubble: Bubble = {
        id: ++bubbleIdCounterRef.current,
        ...generateRandomPosition(containerWidth, containerHeight, 50),
        createdAt: Date.now(),
      };

      return prev.length >= enhancedPerformanceSettings.maxBubbles
        ? [...prev.slice(1), newBubble]
        : [...prev, newBubble];
    });
  }, [
    reducedMotion,
    enhancedPerformanceSettings.maxBubbles,
    enhancedPerformanceSettings.enableEffects,
    enhancedPerformanceSettings.enableAnimations,
    generateRandomPosition,
    isPageVisible,
  ]);

  // useInterval（完全に安全な依存配列）
  const shouldGenerateBubbles =
    category === "tech" &&
    enhancedPerformanceSettings.enableEffects &&
    enhancedPerformanceSettings.enableAnimations &&
    !reducedMotion &&
    isPageVisible; // 画面表示中のみバブル生成

  const bubbleInterval = shouldGenerateBubbles
    ? enhancedPerformanceSettings.bubbleInterval
    : null;

  useInterval(generateBubble, bubbleInterval, [
    // プリミティブ値のみ（順序も重要）
    category,
    shouldGenerateBubbles,
    enhancedPerformanceSettings.maxBubbles,
    enhancedPerformanceSettings.bubbleInterval,
    enhancedPerformanceSettings.enableEffects,
    enhancedPerformanceSettings.enableAnimations,
    reducedMotion,
    isPageVisible,
  ]);

  // イベントハンドラー（安定化 + 重複防止）
  const handleSpiderClick = useCallback(
    (id: number) => {
      setSpiderDisappearingIds((prev) =>
        prev.includes(id) ? prev : [...prev, id],
      );

      const animationDuration = getDisappearDuration(
        enhancedPerformanceSettings.reducedAnimations,
      );

      setTimeout(() => {
        setSpiders((prev) => prev.filter((sp) => sp.id !== id));
        setSpiderDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, animationDuration);
    },
    [setTimeout, enhancedPerformanceSettings.reducedAnimations],
  );

  const handleSnailClick = useCallback(
    (id: number) => {
      setSnailDisappearingIds((prev) =>
        prev.includes(id) ? prev : [...prev, id],
      );

      const animationDuration = getDisappearDuration(
        enhancedPerformanceSettings.reducedAnimations,
      );

      setTimeout(() => {
        setSnails((prev) => prev.filter((snail) => snail.id !== id));
        setSnailDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, animationDuration);
    },
    [setTimeout, enhancedPerformanceSettings.reducedAnimations],
  );

  const handleSnailHover = useCallback(
    (id: number) => {
      if (!enhancedPerformanceSettings.enableAnimations) return;

      setSnails((prev) =>
        prev.map((snail) =>
          snail.id === id ? { ...snail, isMoved: true } : snail,
        ),
      );
    },
    [enhancedPerformanceSettings.enableAnimations],
  );

  const handleBubbleEnd = useCallback((bubbleId: number) => {
    setBubbles((prev) => prev.filter((x) => x.id !== bubbleId));
  }, []);

  // レンダリング関数（安定化）
  const renderSpiderLayer = useCallback(() => {
    if (
      category !== "hobby" ||
      spiders.length === 0 ||
      !enhancedPerformanceSettings.enableEffects
    )
      return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {spiders.map((spider) => (
          <button
            key={spider.id}
            type="button"
            onClick={() => handleSpiderClick(spider.id)}
            aria-label="クモを消す"
            className={cn(
              "spider pointer-events-auto",
              spiderDisappearingIds.includes(spider.id) && "spider-disappear",
              enhancedPerformanceSettings.reducedAnimations &&
                "performance-reduced",
            )}
            style={{
              top: spider.top,
              left: spider.left,
              position: "absolute",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              // CSS変数で角度を確実に指定（文字列で単位付き）
              ["--rotation" as any]: `${spider.rotate}deg`,
            }}
          >
            <span className="spider-rotator" aria-hidden="true">
              <img
                src="/patterns/spider.svg"
                alt=""
                role="presentation"
                draggable={false}
                style={{ pointerEvents: "none" }}
              />
            </span>
          </button>
        ))}
      </div>
    );
  }, [
    category,
    spiders,
    spiderDisappearingIds,
    handleSpiderClick,
    enhancedPerformanceSettings.reducedAnimations,
    enhancedPerformanceSettings.enableEffects,
  ]);

  const renderBubbleLayer = useCallback(() => {
    if (
      category !== "tech" ||
      bubbles.length === 0 ||
      !enhancedPerformanceSettings.enableEffects
    )
      return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {bubbles.map((bubble) => (
          <img
            key={bubble.id}
            src="/patterns/bubbles.svg"
            alt=""
            role="presentation"
            draggable={false}
            className={cn(
              "bubble",
              enhancedPerformanceSettings.reducedAnimations &&
                "performance-reduced",
            )}
            style={{
              top: bubble.top,
              left: bubble.left,
            }}
            onAnimationEnd={() => handleBubbleEnd(bubble.id)}
          />
        ))}
      </div>
    );
  }, [
    category,
    bubbles,
    enhancedPerformanceSettings.reducedAnimations,
    enhancedPerformanceSettings.enableEffects,
    handleBubbleEnd,
  ]);

  const renderSnailLayer = useCallback(() => {
    if (
      category !== "other" ||
      snails.length === 0 ||
      !enhancedPerformanceSettings.enableEffects
    )
      return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {snails.map((snail) => (
          <button
            key={snail.id}
            type="button"
            aria-label="カタツムリを削除"
            className={cn(
              "snail pointer-events-auto",
              snail.isMoved && "snail-move",
              snailDisappearingIds.includes(snail.id) && "snail-disappear",
              enhancedPerformanceSettings.reducedAnimations &&
                "performance-reduced",
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
            onClick={() => handleSnailClick(snail.id)}
            onMouseEnter={() => handleSnailHover(snail.id)}
            onTouchStart={() => handleSnailHover(snail.id)}
          >
            <img
              src="/patterns/snail.svg"
              alt=""
              role="presentation"
              draggable={false}
              style={{ pointerEvents: "none" }}
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
    enhancedPerformanceSettings.reducedAnimations,
    enhancedPerformanceSettings.enableEffects,
  ]);

  // 表示用の値をメモ化（安全なフォールバック）
  const displayValues = useMemo(() => {
    const validCategory = isValidCategory(category);
    return {
      currentLabel: validCategory
        ? CATEGORY_CONFIG.labelMap[category]
        : "不明なカテゴリ",
      currentBg: validCategory ? CATEGORY_CONFIG.bgMap[category] : "bg-white",
    };
  }, [category, isValidCategory]);

  return (
    <section
      className={cn(
        "relative min-h-screen p-6 space-y-6 overflow-hidden",
        displayValues.currentBg,
      )}
    >
      <Header />

      {/* 背景レイヤー */}
      {renderSpiderLayer()}
      {renderBubbleLayer()}
      {renderSnailLayer()}

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

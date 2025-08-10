// app/src/pages/Category.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import "./Category.css";
import Header from "@/components/organisms/Header";
import { useInterval } from "@/hooks/useInterval";
import { useTimers } from "@/hooks/useTimers";

// シンプルなcn関数（shadcn/uiパターンを参考）
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

type Post = { id: number; title: string; content: string; category: string };
type Spider = { id: number; top: string; left: string; rotate: number };
type Bubble = { id: number; top: string; left: string; createdAt: number };
type Snail = { id: number; top: string; left: string; isMoved?: boolean };

// 有効なカテゴリタイプを定義
type CategoryType = "hobby" | "tech" | "other";

// パフォーマンス設定の型定義
type PerformanceSettings = {
  readonly maxBubbles: number;
  readonly maxSpiders: number;
  readonly maxSnails: number;
  readonly bubbleInterval: number;
  readonly enableAnimations: boolean;
  readonly reducedAnimations: boolean;
  readonly enableEffects: boolean;
};

// 最適化されたパフォーマンス判定（メモ化対応）
const createPerformanceSettings = (): ((
  width: number,
) => PerformanceSettings) => {
  const cores =
    typeof navigator !== "undefined" && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 4;
  const userAgent =
    typeof navigator !== "undefined" && navigator.userAgent
      ? navigator.userAgent
      : "";
  const isMac =
    /Mac/i.test(userAgent) && !/(iPhone|iPad|iPod)/i.test(userAgent);

  // コア数とMac判定は一度だけ実行
  return (width: number): PerformanceSettings => {
    const isMobile = width < 768;
    const isLowEnd = !isMac && (cores <= 2 || width < 768);
    const isHighEnd = isMac || (!isMobile && cores >= 8);

    if (isLowEnd) {
      return {
        maxBubbles: 2,
        maxSpiders: 3,
        maxSnails: 2,
        bubbleInterval: 6000,
        enableAnimations: true,
        reducedAnimations: true,
        enableEffects: true,
      };
    }

    if (isHighEnd) {
      return {
        maxBubbles: 8,
        maxSpiders: 8,
        maxSnails: 6,
        bubbleInterval: 2000,
        enableAnimations: true,
        reducedAnimations: false,
        enableEffects: true,
      };
    }

    return {
      maxBubbles: 4,
      maxSpiders: 4,
      maxSnails: 3,
      bubbleInterval: 3000,
      enableAnimations: true,
      reducedAnimations: false,
      enableEffects: true,
    };
  };
};

// パフォーマンス設定ファクトリー（一度だけ作成）
const getPerformanceSettings =
  typeof navigator !== "undefined" && typeof window !== "undefined"
    ? createPerformanceSettings()
    : (width: number) => ({
        maxBubbles: 4,
        maxSpiders: 4,
        maxSnails: 3,
        bubbleInterval: 3000,
        enableAnimations: false,
        reducedAnimations: true,
        enableEffects: false,
      });

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
  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [spiderVisible, setSpiderVisible] = useState(true);
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

  // 動的パフォーマンス設定（メモ化強化）
  const performanceSettings = useMemo(() => {
    const settings = getPerformanceSettings(screenWidth);

    return settings;
  }, [screenWidth]);

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
    (maxTop: number, maxLeft: number) => {
      // 要素サイズ(最大60px)を%換算で余白に反映
      const safetyMargin = 12; // %
      const topMax = Math.max(0, Math.min(100 - safetyMargin, maxTop));
      const leftMax = Math.max(0, Math.min(100 - safetyMargin, maxLeft));
      const topMin = safetyMargin;
      const leftMin = safetyMargin;

      // 範囲が成立しない場合は中央にフォールバック
      if (topMax <= topMin || leftMax <= leftMin) {
        return { top: "50%", left: "50%" };
      }

      const top = Math.random() * (topMax - topMin) + topMin;
      const left = Math.random() * (leftMax - leftMin) + leftMin;
      return { top: `${top.toFixed(2)}%`, left: `${left.toFixed(2)}%` };
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

    if (!isValidCategory(category) || !performanceSettings.enableEffects) {
      setSpiders([]);
      setBubbles([]);
      setSnails([]);
      return;
    }

    // エフェクト初期化
    if (category === "hobby") {
      const spiderCount = reducedMotion
        ? Math.ceil(performanceSettings.maxSpiders / 2)
        : performanceSettings.maxSpiders;

      setSpiders(
        Array.from({ length: spiderCount }, (_, i) => ({
          id: i,
          ...generateRandomPosition(80, 80),
          rotate: generateRandomRotation(),
        })),
      );
      setSpiderVisible(true);
    } else {
      setSpiders([]);
    }

    if (category !== "tech") setBubbles([]);

    if (category === "other") {
      const snailCount = reducedMotion
        ? Math.ceil(performanceSettings.maxSnails / 2)
        : performanceSettings.maxSnails;

      setSnails(
        Array.from({ length: snailCount }, (_, i) => ({
          id: i,
          ...generateRandomPosition(70, 70),
          isMoved: false,
        })),
      );
    } else {
      setSnails([]);
    }
  }, [
    category,
    reducedMotion,
    performanceSettings.maxSpiders,
    performanceSettings.maxSnails,
    performanceSettings.enableEffects,
    isValidCategory,
    generateRandomPosition,
    generateRandomRotation,
  ]);

  // バブル生成（安定化）
  const generateBubble = useCallback(() => {
    if (
      reducedMotion ||
      !performanceSettings.enableEffects ||
      !performanceSettings.enableAnimations
    )
      return;

    setBubbles((prev) => {
      const newBubble: Bubble = {
        id: ++bubbleIdCounterRef.current,
        ...generateRandomPosition(80, 80),
        createdAt: Date.now(),
      };

      return prev.length >= performanceSettings.maxBubbles
        ? [...prev.slice(1), newBubble]
        : [...prev, newBubble];
    });
  }, [
    reducedMotion,
    performanceSettings.maxBubbles,
    performanceSettings.enableEffects,
    performanceSettings.enableAnimations,
    generateRandomPosition,
  ]);

  // useInterval（完全に安全な依存配列）
  const shouldGenerateBubbles =
    category === "tech" &&
    performanceSettings.enableEffects &&
    performanceSettings.enableAnimations &&
    !reducedMotion;

  const bubbleInterval = shouldGenerateBubbles
    ? performanceSettings.bubbleInterval
    : null;

  useInterval(generateBubble, bubbleInterval, [
    // プリミティブ値のみ（順序も重要）
    category,
    shouldGenerateBubbles,
    performanceSettings.maxBubbles,
    performanceSettings.bubbleInterval,
    performanceSettings.enableEffects,
    performanceSettings.enableAnimations,
    reducedMotion,
  ]);

  // イベントハンドラー（安定化）
  const handleSpiderClick = useCallback(
    (id: number) => {
      setSpiderDisappearingIds((prev) => [...prev, id]);
      const animationDuration = performanceSettings.reducedAnimations
        ? 300
        : 600;

      setTimeout(() => {
        setSpiders((prev) => prev.filter((sp) => sp.id !== id));
        setSpiderDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, animationDuration);
    },
    [setTimeout, performanceSettings.reducedAnimations],
  );

  const handleSnailClick = useCallback(
    (id: number) => {
      setSnailDisappearingIds((prev) => [...prev, id]);
      const animationDuration = performanceSettings.reducedAnimations
        ? 300
        : 600;

      setTimeout(() => {
        setSnails((prev) => prev.filter((snail) => snail.id !== id));
        setSnailDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, animationDuration);
    },
    [setTimeout, performanceSettings.reducedAnimations],
  );

  const handleSnailHover = useCallback(
    (id: number) => {
      if (!performanceSettings.enableAnimations) return;

      setSnails((prev) =>
        prev.map((snail) =>
          snail.id === id ? { ...snail, isMoved: true } : snail,
        ),
      );
    },
    [performanceSettings.enableAnimations],
  );

  const handleBubbleEnd = useCallback((bubbleId: number) => {
    setBubbles((prev) => prev.filter((x) => x.id !== bubbleId));
  }, []);

  // レンダリング関数（安定化）
  const renderSpiderLayer = useCallback(() => {
    if (
      category !== "hobby" ||
      !spiderVisible ||
      spiders.length === 0 ||
      !performanceSettings.enableEffects
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
              `rotate-${spider.rotate}`,
              spiderDisappearingIds.includes(spider.id) && "spider-disappear",
              performanceSettings.reducedAnimations && "performance-reduced",
            )}
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
    spiderVisible,
    spiders,
    spiderDisappearingIds,
    handleSpiderClick,
    performanceSettings.reducedAnimations,
    performanceSettings.enableEffects,
  ]);

  const renderBubbleLayer = useCallback(() => {
    if (
      category !== "tech" ||
      bubbles.length === 0 ||
      !performanceSettings.enableEffects
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
              performanceSettings.reducedAnimations && "performance-reduced",
            )}
            style={{
              top: bubble.top,
              left: bubble.left,
              animationDuration:
                reducedMotion || !performanceSettings.enableAnimations
                  ? "0s"
                  : undefined,
            }}
            onAnimationEnd={() => handleBubbleEnd(bubble.id)}
          />
        ))}
      </div>
    );
  }, [
    category,
    bubbles,
    reducedMotion,
    performanceSettings.reducedAnimations,
    performanceSettings.enableEffects,
    performanceSettings.enableAnimations,
    handleBubbleEnd,
  ]);

  const renderSnailLayer = useCallback(() => {
    if (
      category !== "other" ||
      snails.length === 0 ||
      !performanceSettings.enableEffects
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
              performanceSettings.reducedAnimations && "performance-reduced",
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
    performanceSettings.reducedAnimations,
    performanceSettings.enableEffects,
  ]);

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

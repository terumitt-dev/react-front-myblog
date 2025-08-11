// app/src/pages/Category.tsx
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/organisms/Header";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import { useInterval } from "@/hooks/useInterval";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import {
  safeJsonParse,
  handleStorageError,
} from "@/components/utils/errorHandler";
import {
  displayTextSafe,
  displayTextPlain,
} from "@/components/utils/sanitizer";
import { CATEGORY_COLORS } from "../components/utils/colors";
import type { CategoryType } from "../components/utils/colors";
import "./Category.css";

// シンプルなcn関数
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

// パフォーマンス設定の型安全性を向上
type PerformanceSettings = {
  maxSpiders: number;
  maxBubbles: number;
  maxSnails: number;
  bubbleInterval: number;
  enableEffects: boolean;
  enableAnimations: boolean;
  useLowQualityEffects: boolean;
};

// JSONから読み込む際の型
interface RawPost {
  id: string | number;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
}

// デバイス性能情報の型
interface DeviceInfo {
  memory?: number;
  concurrency?: number;
  connection?: string;
}

// メモ化されたパフォーマンス設定作成
const createPerformanceSettings = (
  maxSpiders: number,
  maxBubbles: number,
  maxSnails: number,
  bubbleInterval: number,
  enableEffects: boolean,
  enableAnimations: boolean,
  useLowQualityEffects: boolean,
): PerformanceSettings => ({
  maxSpiders,
  maxBubbles,
  maxSnails,
  bubbleInterval,
  enableEffects,
  enableAnimations,
  useLowQualityEffects,
});

// パフォーマンス設定（バブル用のみ使用）
const getPerformanceSettings = (
  screenWidth: number,
  deviceInfo: DeviceInfo = {},
  isPageVisible = true,
  isUnderStress = false,
): PerformanceSettings => {
  // デバイス性能を考慮
  const isLowEndDevice = deviceInfo.memory && deviceInfo.memory < 4;
  const isLowCPU = deviceInfo.concurrency && deviceInfo.concurrency < 4;
  const shouldReduceEffects =
    isLowEndDevice || isLowCPU || isUnderStress || !isPageVisible;

  if (screenWidth < 768 || shouldReduceEffects) {
    return createPerformanceSettings(0, 2, 0, 6000, false, true, true);
  } else if (screenWidth < 1024) {
    return createPerformanceSettings(2, 3, 2, 4500, true, true, true);
  } else if (screenWidth < 1280) {
    return createPerformanceSettings(3, 5, 3, 3500, true, true, false);
  } else {
    return createPerformanceSettings(5, 6, 5, 3000, true, true, false);
  }
};

// 定数を外部定義（不変）
const ROTATION_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

// アニメーション期間（reduced-motion対応）
const getDisappearDuration = (reducedAnimations: boolean) =>
  reducedAnimations ? 100 : 250;

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<Post[]>([]);

  // エフェクト状態（初期値を最適化）
  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [snails, setSnails] = useState<Snail[]>([]);

  // 消失中のアイテムID（パフォーマンス最適化）
  const [spiderDisappearingIds, setSpiderDisappearingIds] = useState<
    Set<number>
  >(() => new Set());
  const [snailDisappearingIds, setSnailDisappearingIds] = useState<Set<number>>(
    () => new Set(),
  );

  // パフォーマンス監視
  const performanceMetrics = usePerformanceMonitor(true);

  // reduced-motion検出（初期化を最適化）
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // 画面幅の監視（デバウンス強化）
  const [screenWidth, setScreenWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const resizeTimeoutRef = useRef<number | null>(null);
  const lastResizeRef = useRef<number>(0);

  // Page Visibility API（最適化）
  const [isPageVisible, setIsPageVisible] = useState(() => {
    if (typeof document === "undefined") return true;
    return !document.hidden;
  });

  // デバイス性能情報取得
  const deviceInfo = useMemo((): DeviceInfo => {
    if (typeof navigator === "undefined") return {};

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string };
    };

    return {
      memory: nav.deviceMemory,
      concurrency: nav.hardwareConcurrency,
      connection: nav.connection?.effectiveType,
    };
  }, []);

  // Page Visibility監視（最適化）
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);

      if (!isVisible) {
        console.debug("🔇 Page hidden: エフェクト一時停止");
      } else {
        console.debug("👁️ Page visible: エフェクト再開");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // デバウンス付きリサイズハンドラー（最適化）
  useEffect(() => {
    const handleResize = () => {
      const now = Date.now();

      // スロットリング（16ms = 60fps制限）
      if (now - lastResizeRef.current < 16) return;
      lastResizeRef.current = now;

      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        setScreenWidth(window.innerWidth);
        resizeTimeoutRef.current = null;
      }, 200);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // パフォーマンス設定（バブル生成用のみ）
  const enhancedPerformanceSettings = useMemo(() => {
    return getPerformanceSettings(
      screenWidth,
      deviceInfo,
      isPageVisible,
      performanceMetrics.isUnderStress,
    );
  }, [
    screenWidth,
    deviceInfo,
    isPageVisible,
    performanceMetrics.isUnderStress,
  ]);

  // 安定化されたヘルパー関数
  const bubbleIdCounterRef = useRef(0);

  // カテゴリバリデーション（純粋関数）
  const isValidCategory = useCallback(
    (cat: string | undefined): cat is CategoryType =>
      cat === "hobby" || cat === "tech" || cat === "other",
    [],
  );

  // 位置生成（最適化）
  const generateRandomPosition = useCallback(
    (containerWidth: number, containerHeight: number, elSize = 60) => {
      const margin = Math.max(elSize, 20);
      const maxLeftPx = Math.max(margin, containerWidth - margin);
      const maxTopPx = Math.max(margin, containerHeight - margin);

      const leftPx = Math.random() * (maxLeftPx - margin) + margin;
      const topPx = Math.random() * (maxTopPx - margin) + margin;

      return { top: `${topPx}px`, left: `${leftPx}px` };
    },
    [],
  );

  // 回転角度生成（最適化）
  const generateRandomRotation = useCallback(() => {
    return ROTATION_ANGLES[Math.floor(Math.random() * ROTATION_ANGLES.length)];
  }, []);

  // reduced-motion監視（最適化）
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(e.matches);
    };

    setReducedMotion(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // 完全に静的な初期化（カテゴリ変更時のみ）
  useEffect(() => {
    // 投稿読み込み
    const saved = localStorage.getItem("myblog-posts");
    if (saved) {
      try {
        const rawPosts = safeJsonParse<RawPost[]>(saved, []);
        if (isValidCategory(category)) {
          const validPosts: Post[] = rawPosts
            .filter((p): p is RawPost => p && typeof p === "object")
            .map((p: RawPost) => ({
              ...p,
              id: Number(p.id),
              createdAt: p.createdAt || new Date().toISOString(),
            }))
            .filter((p) => p.category === category);
          setPosts(validPosts);
        } else {
          setPosts([]);
          return;
        }
      } catch (e) {
        console.error("JSON parse error:", e);
        handleStorageError(e, "load category posts");
        localStorage.removeItem("myblog-posts");
        setPosts([]);
        return;
      }
    }

    // カテゴリが無効な場合のみクリア
    if (!isValidCategory(category)) {
      setSpiders([]);
      setBubbles([]);
      setSnails([]);
      return;
    }

    // 画面サイズ取得
    const containerWidth = window?.innerWidth || 1024;
    const containerHeight = window?.innerHeight || 768;

    // 固定数でエフェクト初期化（設定に依存しない）
    if (category === "hobby") {
      // 画面サイズに応じた固定数（1.5倍）
      let spiderCount = 5; // デフォルト（大画面）
      if (containerWidth < 768) spiderCount = 0;
      else if (containerWidth < 1024) spiderCount = 2;
      else if (containerWidth < 1280) spiderCount = 3;

      if (spiderCount > 0) {
        setSpiders(
          Array.from({ length: spiderCount }, (_, i) => ({
            id: Date.now() + i,
            ...generateRandomPosition(containerWidth, containerHeight, 50),
            rotate: generateRandomRotation(),
          })),
        );
      } else {
        setSpiders([]);
      }
    } else {
      setSpiders([]);
    }

    if (category === "tech") {
      setBubbles([]); // 初期化のみ、バブルは別途生成
    } else {
      setBubbles([]);
    }

    if (category === "other") {
      // 画面サイズに応じた固定数（1.5倍）
      let snailCount = 5; // デフォルト（大画面）
      if (containerWidth < 768) snailCount = 0;
      else if (containerWidth < 1024) snailCount = 2;
      else if (containerWidth < 1280) snailCount = 3;

      if (snailCount > 0) {
        setSnails(
          Array.from({ length: snailCount }, (_, i) => ({
            id: Date.now() + i + 1000,
            ...generateRandomPosition(containerWidth, containerHeight, 60),
            isMoved: false,
          })),
        );
      } else {
        setSnails([]);
      }
    } else {
      setSnails([]);
    }
  }, [
    category, // カテゴリ変更時のみ
    isValidCategory,
    generateRandomPosition,
    generateRandomRotation,
  ]);

  // バブル生成（最適化）
  const generateBubble = useCallback(() => {
    if (
      typeof window === "undefined" ||
      reducedMotion ||
      !enhancedPerformanceSettings.enableEffects ||
      !enhancedPerformanceSettings.enableAnimations ||
      !isPageVisible ||
      performanceMetrics.isUnderStress
    ) {
      return;
    }

    setBubbles((prev) => {
      // 古いバブルの自動削除（メモリリーク防止）
      const now = Date.now();
      const filteredBubbles = prev.filter(
        (bubble) => now - bubble.createdAt < 10000,
      );

      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      const newBubble: Bubble = {
        id: ++bubbleIdCounterRef.current,
        ...generateRandomPosition(containerWidth, containerHeight, 50),
        createdAt: now,
      };

      return filteredBubbles.length >= enhancedPerformanceSettings.maxBubbles
        ? [...filteredBubbles.slice(1), newBubble]
        : [...filteredBubbles, newBubble];
    });
  }, [
    reducedMotion,
    enhancedPerformanceSettings.maxBubbles,
    enhancedPerformanceSettings.enableEffects,
    enhancedPerformanceSettings.enableAnimations,
    generateRandomPosition,
    isPageVisible,
    performanceMetrics.isUnderStress,
  ]);

  // バブル生成タイミング（最適化）
  const shouldGenerateBubbles = useMemo(
    () =>
      category === "tech" &&
      enhancedPerformanceSettings.enableEffects &&
      enhancedPerformanceSettings.enableAnimations &&
      !reducedMotion &&
      isPageVisible &&
      !performanceMetrics.isUnderStress,
    [
      category,
      enhancedPerformanceSettings.enableEffects,
      enhancedPerformanceSettings.enableAnimations,
      reducedMotion,
      isPageVisible,
      performanceMetrics.isUnderStress,
    ],
  );

  const bubbleInterval = shouldGenerateBubbles
    ? enhancedPerformanceSettings.bubbleInterval
    : null;

  useInterval(generateBubble, bubbleInterval, [
    category,
    shouldGenerateBubbles,
    enhancedPerformanceSettings.maxBubbles,
    enhancedPerformanceSettings.bubbleInterval,
    enhancedPerformanceSettings.enableEffects,
    enhancedPerformanceSettings.enableAnimations,
    reducedMotion,
    isPageVisible,
    performanceMetrics.isUnderStress,
  ]);

  // スパイダークリックハンドラー
  const handleSpiderClick = useCallback(
    (spiderId: number) => {
      setSpiderDisappearingIds((prev) => new Set([...prev, spiderId]));

      setTimeout(() => {
        setSpiders((prev) => prev.filter((spider) => spider.id !== spiderId));
        setSpiderDisappearingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(spiderId);
          return newSet;
        });
      }, getDisappearDuration(reducedMotion));
    },
    [reducedMotion],
  );

  // カタツムリハンドラー
  const handleSnailClick = useCallback(
    (snailId: number) => {
      setSnailDisappearingIds((prev) => new Set([...prev, snailId]));

      setTimeout(() => {
        setSnails((prev) => prev.filter((snail) => snail.id !== snailId));
        setSnailDisappearingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(snailId);
          return newSet;
        });
      }, getDisappearDuration(reducedMotion));
    },
    [reducedMotion],
  );

  const handleSnailHover = useCallback((snailId: number) => {
    setSnails((prev) =>
      prev.map((snail) =>
        snail.id === snailId ? { ...snail, isMoved: true } : snail,
      ),
    );
  }, []);

  // バブル終了ハンドラー
  const handleBubbleEnd = useCallback((bubbleId: number) => {
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== bubbleId));
  }, []);

  // スパイダーレイヤー（最適化レンダリング）
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
              enhancedPerformanceSettings.useLowQualityEffects &&
                "performance-reduced",
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
  }, [
    category,
    spiders,
    spiderDisappearingIds,
    handleSpiderClick,
    enhancedPerformanceSettings.useLowQualityEffects,
  ]);

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
            className={cn(
              "bubble",
              enhancedPerformanceSettings.useLowQualityEffects &&
                "performance-reduced",
            )}
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
  }, [
    category,
    bubbles,
    handleBubbleEnd,
    enhancedPerformanceSettings.useLowQualityEffects,
  ]);

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
              enhancedPerformanceSettings.useLowQualityEffects &&
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
    enhancedPerformanceSettings.useLowQualityEffects,
  ]);

  // カテゴリバリデーション
  if (!isValidCategory(category)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            無効なカテゴリです
          </h1>
          <p className="text-gray-600 mt-2">
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {categoryConfig.name}のページ
          </h1>
          <p className="text-gray-600 mb-6">
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
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold break-words mb-2">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: displayTextSafe(post.title),
                      }}
                    />
                  </h2>
                  <p className="text-gray-700 mb-4 break-words">
                    {displayTextPlain(post.content).slice(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <Link
                      to={`/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition"
                    >
                      読む →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* パフォーマンス情報（開発用） */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
            <div>FPS: {Math.round(performanceMetrics.frameRate)}</div>
            <div>
              Effects:{" "}
              {enhancedPerformanceSettings.enableEffects ? "ON" : "OFF"}
            </div>
            <div>Stress: {performanceMetrics.isUnderStress ? "YES" : "NO"}</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Category;

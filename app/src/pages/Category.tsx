// app/src/pages/Category.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import "./Category.css";
import Header from "@/components/organisms/Header";
import { useInterval } from "@/hooks/useInterval";
import { useTimers } from "@/hooks/useTimers";

type Post = { id: number; title: string; content: string; category: string };
type Spider = { id: number; top: string; left: string; rotate: number };
type Bubble = { id: number; top: string; left: string; createdAt: number };
type Snail = { id: number; top: string; left: string; isMoved?: boolean };

// 有効なカテゴリタイプを定義
type CategoryType = "hobby" | "tech" | "other";

// 安全なAPIアクセス用のヘルパー関数
const getDeviceInfo = () => {
  const cores = navigator.hardwareConcurrency || 4;

  // deviceMemoryの安全な取得
  let memory = 8; // 安全なデフォルト値
  try {
    const deviceMemory = (navigator as any).deviceMemory;
    if (typeof deviceMemory === "number" && deviceMemory > 0) {
      memory = deviceMemory;
    }
  } catch {
    // 取得に失敗した場合はデフォルト値を使用
  }

  // connectionの安全な取得
  let connectionType = "unknown";
  let saveData = false;
  try {
    const connection = (navigator as any).connection;
    if (connection) {
      connectionType = connection.effectiveType || "unknown";
      saveData = Boolean(connection.saveData);
    }
  } catch {
    // 取得に失敗した場合はデフォルト値を使用
  }

  return { cores, memory, connectionType, saveData };
};

// より信頼性の高いパフォーマンス設定
const getPerformanceSettings = () => {
  const { cores, memory, connectionType, saveData } = getDeviceInfo();
  const userAgent = navigator.userAgent;
  const screenWidth = window.innerWidth;

  // デバイス種類の判定
  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet =
    /iPad|Android.*(?:Tablet|Tab)/i.test(userAgent) ||
    (screenWidth >= 768 && screenWidth <= 1024 && isMobile);

  // Apple デバイスの詳細判定
  const isAppleDevice = /Mac|iPhone|iPad|iPod/i.test(userAgent);
  const isMacOS =
    /Mac/i.test(userAgent) && !/(iPhone|iPad|iPod)/i.test(userAgent);
  const isAppleSilicon = isMacOS && cores >= 8; // M1以降の推定

  // ネットワーク状況の判定
  const isSlowNetwork =
    connectionType === "slow-2g" || connectionType === "2g" || saveData;

  // パフォーマンスレベルの判定（より保守的なアプローチ）
  let performanceLevel: "low" | "medium" | "high" = "medium";

  // 低性能端末の判定
  if (
    (!isAppleDevice && cores <= 2) ||
    memory <= 2 ||
    screenWidth < 480 ||
    isSlowNetwork ||
    (isMobile && !isTablet && cores <= 4)
  ) {
    performanceLevel = "low";
  }
  // 高性能端末の判定
  else if (
    isAppleSilicon ||
    (!isMobile && cores >= 8 && memory >= 8) ||
    (isMacOS && cores >= 4) ||
    (!isMobile && !isAppleDevice && cores >= 6 && memory >= 16)
  ) {
    performanceLevel = "high";
  }

  // 開発時のログ出力
  if (process.env.NODE_ENV === "development") {
    console.log("Device Performance Analysis:", {
      cores,
      memory,
      connectionType,
      saveData,
      isMobile,
      isTablet,
      isAppleDevice,
      isMacOS,
      isAppleSilicon,
      screenWidth,
      performanceLevel,
      userAgent: userAgent.substring(0, 80) + "...",
    });
  }

  // パフォーマンスレベルに基づく設定
  switch (performanceLevel) {
    case "low":
      return {
        maxBubbles: 1,
        maxSpiders: 2,
        maxSnails: 1,
        bubbleInterval: 8000,
        enableAnimations: false,
        reducedAnimations: true,
        enableEffects: false,
        performanceLevel: "low" as const,
      };

    case "high":
      return {
        maxBubbles: 8,
        maxSpiders: 8,
        maxSnails: 6,
        bubbleInterval: 2000,
        enableAnimations: true,
        reducedAnimations: false,
        enableEffects: true,
        performanceLevel: "high" as const,
      };

    default: // medium
      return {
        maxBubbles: 4,
        maxSpiders: 4,
        maxSnails: 3,
        bubbleInterval: 3000,
        enableAnimations: true,
        reducedAnimations: false,
        enableEffects: true,
        performanceLevel: "medium" as const,
      };
  }
};

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
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // パフォーマンス設定（起動時に1回だけ取得）
  const performanceSettings = useMemo(() => getPerformanceSettings(), []);

  // 安定化されたヘルパー関数
  const { setTimeout } = useTimers();
  const bubbleIdCounterRef = useRef(0);

  const isValidCategory = useCallback(
    (cat: string | undefined): cat is CategoryType =>
      cat === "hobby" || cat === "tech" || cat === "other",
    [],
  );

  const generateRandomPosition = useCallback(
    (maxTop: number, maxLeft: number) => ({
      top: `${Math.random() * maxTop + 10}%`,
      left: `${Math.random() * maxLeft + 10}%`,
    }),
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
        setPosts(all.filter((p) => p.category === category));
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

  // バブル生成
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

  // useInterval（安定した依存配列）
  const intervalConfig = useMemo(
    () => ({
      shouldRun:
        category === "tech" &&
        performanceSettings.enableEffects &&
        performanceSettings.enableAnimations &&
        !reducedMotion,
      interval: performanceSettings.bubbleInterval,
      dependencies: {
        category,
        reducedMotion,
        maxBubbles: performanceSettings.maxBubbles,
        enableEffects: performanceSettings.enableEffects,
        enableAnimations: performanceSettings.enableAnimations,
      },
    }),
    [
      category,
      reducedMotion,
      performanceSettings.maxBubbles,
      performanceSettings.bubbleInterval,
      performanceSettings.enableEffects,
      performanceSettings.enableAnimations,
    ],
  );

  useInterval(
    generateBubble,
    intervalConfig.shouldRun ? intervalConfig.interval : null,
    [intervalConfig.dependencies],
  );

  // イベントハンドラー
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

  // レンダリング関数
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
            className={`spider pointer-events-auto rotate-${spider.rotate} ${
              spiderDisappearingIds.includes(spider.id)
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
            className={`bubble ${performanceSettings.reducedAnimations ? "performance-reduced" : ""}`}
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
            className={`snail pointer-events-auto ${snail.isMoved ? "snail-move" : ""} ${
              snailDisappearingIds.includes(snail.id) ? "snail-disappear" : ""
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
            onClick={() => handleSnailClick(snail.id)}
            onMouseEnter={() => handleSnailHover(snail.id)}
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
      className={`relative min-h-screen p-6 space-y-6 overflow-hidden ${displayValues.currentBg}`}
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

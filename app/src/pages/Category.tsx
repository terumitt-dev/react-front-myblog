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

// デバイス性能に基づく設定（安定化）
const getPerformanceSettings = () => {
  const cores = navigator.hardwareConcurrency || 4;
  const isLowEnd =
    cores <= 2 ||
    window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  return {
    maxBubbles: isLowEnd ? 4 : 8,
    maxSpiders: isLowEnd ? 4 : 8,
    maxSnails: isLowEnd ? 3 : 6,
    bubbleInterval: isLowEnd ? 3000 : 2000,
    enableAnimations: !isLowEnd,
  } as const;
};

// 回転角度の配列（計算を簡素化）
const ROTATION_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

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

  // アニメーション設定の動的監視
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // パフォーマンス設定を安定化（参照の一意性を保証）
  const performanceSettings = useMemo(() => {
    const settings = getPerformanceSettings();
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost"
    ) {
      console.log("Performance settings:", settings);
    }
    return settings;
  }, []); // 空の依存配列で初期化時のみ実行

  // タイマー管理フック
  const { setTimeout } = useTimers();

  // バブルID生成用のカウンター
  const bubbleIdCounterRef = useRef(0);

  // カテゴリの型安全性チェック
  const isValidCategory = useCallback(
    (cat: string | undefined): cat is CategoryType => {
      return cat === "hobby" || cat === "tech" || cat === "other";
    },
    [],
  );

  // prefers-reduced-motionの変更を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(e.matches);
    };

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

  // ランダム配置生成のヘルパー関数
  const generateRandomPosition = useCallback(
    (maxTop: number, maxLeft: number) => ({
      top: `${Math.random() * maxTop + 10}%`,
      left: `${Math.random() * maxLeft + 10}%`,
    }),
    [],
  );

  // ランダム回転角度生成
  const generateRandomRotation = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * ROTATION_ANGLES.length);
    return ROTATION_ANGLES[randomIndex];
  }, []);

  // 投稿とエフェクト初期化（最適化）
  useEffect(() => {
    // 投稿の読み込み
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

    // カテゴリ別エフェクト初期化
    if (!isValidCategory(category)) return;

    if (category === "hobby") {
      const spiderCount = reducedMotion
        ? Math.ceil(performanceSettings.maxSpiders / 2)
        : performanceSettings.maxSpiders;

      const newSpiders: Spider[] = Array.from(
        { length: spiderCount },
        (_, i) => ({
          id: i,
          ...generateRandomPosition(80, 80),
          rotate: generateRandomRotation(),
        }),
      );

      setSpiders(newSpiders);
      setSpiderVisible(true);
    } else {
      setSpiders([]);
    }

    if (category !== "tech") {
      setBubbles([]);
    }

    if (category === "other") {
      const snailCount = reducedMotion
        ? Math.ceil(performanceSettings.maxSnails / 2)
        : performanceSettings.maxSnails;

      const newSnails: Snail[] = Array.from({ length: snailCount }, (_, i) => ({
        id: i,
        ...generateRandomPosition(70, 70),
        isMoved: false,
      }));

      setSnails(newSnails);
    } else {
      setSnails([]);
    }
  }, [
    category,
    reducedMotion,
    performanceSettings,
    isValidCategory,
    generateRandomPosition,
    generateRandomRotation,
  ]);

  // バブル生成関数（依存配列を修正）
  const generateBubble = useCallback(() => {
    if (reducedMotion) return;

    setBubbles((prev) => {
      const maxBubbles = performanceSettings.maxBubbles;

      const newBubble: Bubble = {
        id: ++bubbleIdCounterRef.current,
        ...generateRandomPosition(80, 80),
        createdAt: Date.now(),
      };

      if (prev.length >= maxBubbles) {
        return [...prev.slice(1), newBubble];
      }

      return [...prev, newBubble];
    });
  }, [reducedMotion, performanceSettings.maxBubbles, generateRandomPosition]);

  // useInterval（依存配列を最適化）
  useInterval(
    generateBubble,
    category === "tech" ? performanceSettings.bubbleInterval : null,
    [category, reducedMotion],
  );

  // クモ削除ハンドラ（依存配列を最適化）
  const handleSpiderClick = useCallback(
    (id: number) => {
      setSpiderDisappearingIds((prev) => [...prev, id]);

      setTimeout(() => {
        setSpiders((prev) => prev.filter((sp) => sp.id !== id));
        setSpiderDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, 600);
    },
    [setTimeout],
  );

  // カタツムリ削除ハンドラ（依存配列を最適化）
  const handleSnailClick = useCallback(
    (id: number) => {
      setSnailDisappearingIds((prev) => [...prev, id]);

      setTimeout(() => {
        setSnails((prev) => prev.filter((snail) => snail.id !== id));
        setSnailDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, 600);
    },
    [setTimeout],
  );

  // カタツムリホバーハンドラ
  const handleSnailHover = useCallback((id: number) => {
    setSnails((prev) =>
      prev.map((snail) =>
        snail.id === id ? { ...snail, isMoved: true } : snail,
      ),
    );
  }, []);

  // クモレイヤーレンダリング（最適化）
  const renderSpiderLayer = useCallback(() => {
    if (category !== "hobby" || !spiderVisible || spiders.length === 0)
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
            }`}
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
  ]);

  // 泡レイヤーレンダリング（最適化）
  const renderBubbleLayer = useCallback(() => {
    if (category !== "tech" || bubbles.length === 0) return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {bubbles.map((bubble) => (
          <img
            key={bubble.id}
            src="/patterns/bubbles.svg"
            alt=""
            className="bubble"
            style={{
              top: bubble.top,
              left: bubble.left,
              animationDuration: reducedMotion ? "0s" : undefined,
            }}
            onAnimationEnd={() => {
              setBubbles((prev) => prev.filter((x) => x.id !== bubble.id));
            }}
          />
        ))}
      </div>
    );
  }, [category, bubbles, reducedMotion]);

  // カタツムリレイヤーレンダリング（最適化）
  const renderSnailLayer = useCallback(() => {
    if (category !== "other" || snails.length === 0) return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {snails.map((snail) => (
          <button
            key={snail.id}
            type="button"
            aria-label="カタツムリを削除"
            className={`snail pointer-events-auto ${snail.isMoved ? "snail-move" : ""} ${
              snailDisappearingIds.includes(snail.id) ? "snail-disappear" : ""
            }`}
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
  ]);

  // 定数をメモ化
  const categoryConfig = useMemo(
    () => ({
      labelMap: {
        hobby: "しゅみ",
        tech: "テック",
        other: "その他",
      } as const,
      bgMap: {
        hobby: "bg-[#E1C6F9]",
        tech: "bg-[#AFEBFF]",
        other: "bg-[#CCF5B1]",
      } as const,
    }),
    [],
  );

  const currentLabel = isValidCategory(category)
    ? categoryConfig.labelMap[category]
    : category;
  const currentBg = isValidCategory(category)
    ? categoryConfig.bgMap[category]
    : "bg-white";

  return (
    <section
      className={`relative min-h-screen p-6 space-y-6 overflow-hidden ${currentBg}`}
    >
      <Header />

      {/* 背景レイヤー */}
      {renderSpiderLayer()}
      {renderBubbleLayer()}
      {renderSnailLayer()}

      {/* コンテンツ */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold">{currentLabel} カテゴリの記事</h1>

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

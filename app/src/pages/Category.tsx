// app/src/pages/Category.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react"; // useRefを追加
import BackToHomeButton from "@/components/molecules/BackToHomeButton";
import "./Category.css";
import Header from "@/components/organisms/Header";
import { useInterval } from "@/hooks/useInterval";
import { useTimers } from "@/hooks/useTimers";

type Post = { id: number; title: string; content: string; category: string };
type Spider = { id: number; top: string; left: string; rotate: number };
type Bubble = { id: number; top: string; left: string; createdAt: number };
type Snail = { id: number; top: string; left: string; isMoved?: boolean };

const MAX_BUBBLES = 8; // 10から8に削減
const MAX_SPIDERS = 8; // 12から8に削減
const MAX_SNAILS = 6; // 8から6に削減
const BUBBLE_INTERVAL = 2000; // 1000msから2000msに変更
const BUBBLE_LIFETIME = 8000; // 8秒後に自動削除

// アニメーション無効化フラグ
const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

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

  // タイマー管理フックを使用
  const { setTimeout } = useTimers();

  // バブルID生成用のカウンター
  const bubbleIdCounterRef = useRef(0);

  // 投稿とエフェクト初期化
  useEffect(() => {
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

    if (category === "hobby") {
      // アニメーション無効化設定がある場合は要素数を削減
      const spiderCount = REDUCED_MOTION ? 4 : MAX_SPIDERS;
      const newSpiders: Spider[] = [...Array(spiderCount)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 80 + 10}%`, // 端を避ける
        left: `${Math.random() * 80 + 10}%`,
        rotate: Math.floor(Math.random() * 8) * 45, // 45度刻みで制限（8方向）
      }));
      setSpiders(newSpiders);
      setSpiderVisible(true);
    } else {
      setSpiders([]);
    }

    if (category !== "tech") {
      setBubbles([]);
    }

    if (category === "other") {
      // アニメーション無効化設定がある場合は要素数を削減
      const snailCount = REDUCED_MOTION ? 3 : MAX_SNAILS;
      const newSnails: Snail[] = [...Array(snailCount)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 70 + 15}%`, // より端を避ける
        left: `${Math.random() * 70 + 15}%`,
        isMoved: false,
      }));
      setSnails(newSnails);
    } else {
      setSnails([]);
    }
  }, [category]);

  // useIntervalを使用
  useInterval(
    () => {
      // アニメーション無効化設定がある場合は生成しない
      if (REDUCED_MOTION) return;

      setBubbles((prev) => {
        // 最大数に達している場合は古いものを削除してから新しいものを追加
        if (prev.length >= MAX_BUBBLES) {
          // 最も古いバブルを削除
          const newBubbles = prev.slice(1);
          const newBubble: Bubble = {
            id: ++bubbleIdCounterRef.current,
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            createdAt: Date.now(),
          };
          return [...newBubbles, newBubble];
        }

        const newBubble: Bubble = {
          id: ++bubbleIdCounterRef.current,
          top: `${Math.random() * 80 + 10}%`,
          left: `${Math.random() * 80 + 10}%`,
          createdAt: Date.now(),
        };
        return [...prev, newBubble];
      });
    },
    category === "tech" ? BUBBLE_INTERVAL : null,
    [category],
  );

  // バブルの自動削除（ライフサイクル管理）
  useInterval(
    () => {
      if (REDUCED_MOTION) return;

      setBubbles((prev) => {
        const now = Date.now();
        return prev.filter(
          (bubble) => now - bubble.createdAt < BUBBLE_LIFETIME,
        );
      });
    },
    category === "tech" ? 3000 : null,
    [category],
  );

  // クモ削除ハンドラ
  const handleClick = useCallback(
    (id: number) => {
      setSpiderDisappearingIds((prev) => [...prev, id]);

      setTimeout(() => {
        setSpiders((prev) => prev.filter((sp) => sp.id !== id));
        setSpiderDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, 600);
    },
    [setTimeout, setSpiders, setSpiderDisappearingIds],
  );

  // カタツムリ削除ハンドラ
  const handleSnailClick = useCallback(
    (id: number) => {
      setSnailDisappearingIds((prev) => [...prev, id]);

      setTimeout(() => {
        setSnails((prev) => prev.filter((snail) => snail.id !== id));
        setSnailDisappearingIds((prev) => prev.filter((x) => x !== id));
      }, 600);
    },
    [setTimeout, setSnails, setSnailDisappearingIds],
  );

  // クモレイヤー
  const renderSpiderLayer = () =>
    category === "hobby" &&
    spiderVisible && (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {spiders.map((s) => {
          // 回転角度を8方向に丸める（0, 45, 90, 135, 180, 225, 270, 315）
          const rotateClass = `rotate-${(Math.round(s.rotate / 45) * 45) % 360}`;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleClick(s.id)}
              aria-label="クモを消す"
              className={`spider pointer-events-auto ${rotateClass} ${
                spiderDisappearingIds.includes(s.id) ? "spider-disappear" : ""
              }`}
              style={{
                top: s.top,
                left: s.left,
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
          );
        })}
      </div>
    );

  // 泡レイヤー
  const renderBubbleLayer = useCallback(() => {
    if (category !== "tech") return null;

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {bubbles.map((b) => (
          <img
            key={b.id}
            src="/patterns/bubbles.svg"
            alt=""
            className="bubble"
            style={{
              top: b.top,
              left: b.left,
              // CSSアニメーション無効化対応
              animationDuration: REDUCED_MOTION ? "0s" : undefined,
            }}
            onAnimationEnd={() => {
              // アニメーション終了時に削除
              setBubbles((prev) => prev.filter((x) => x.id !== b.id));
            }}
          />
        ))}
      </div>
    );
  }, [category, bubbles]);

  // カタツムリレイヤー
  const renderSnailLayer = () =>
    category === "other" && (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {snails.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-label="カタツムリを削除"
            className={`snail pointer-events-auto ${s.isMoved ? "snail-move" : ""} ${snailDisappearingIds.includes(s.id) ? "snail-disappear" : ""}`}
            style={{
              top: s.top,
              left: s.left,
              position: "absolute",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            onClick={() => handleSnailClick(s.id)}
            onMouseEnter={() => {
              setSnails((prev) =>
                prev.map((snail) =>
                  snail.id === s.id ? { ...snail, isMoved: true } : snail,
                ),
              );
            }}
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

  const labelMap = {
    hobby: "しゅみ",
    tech: "テック",
    other: "その他",
  } as const;
  const bgMap = {
    hobby: "bg-[#E1C6F9]",
    tech: "bg-[#AFEBFF]",
    other: "bg-[#CCF5B1]",
  } as const;

  return (
    <section
      className={`relative min-h-screen p-6 space-y-6 overflow-hidden ${
        bgMap[category as keyof typeof bgMap] ?? "bg-white"
      }`}
    >
      <Header />
      {/* 背景レイヤー */}
      {renderSpiderLayer()}
      {renderBubbleLayer()}
      {renderSnailLayer()}

      {/* コンテンツ */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold">
          {labelMap[category as keyof typeof labelMap] ?? category}{" "}
          カテゴリの記事
        </h1>

        {posts.length === 0 ? (
          <p>このカテゴリにはまだ投稿がありません。</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {posts.map((post) => (
              <div
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
              </div>
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

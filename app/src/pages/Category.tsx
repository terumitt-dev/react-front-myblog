// app/src/pages/Category.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BackToTopButton from "@/components/molecules/BackToTopButton";
import "./Category.css";
import Header from "@/components/organisms/Header";

type Post = { id: number; title: string; content: string; category: string };
type Spider = { id: number; top: string; left: string; rotate: number };
type Bubble = { id: number; top: string; left: string };
type Snail = { id: number; top: string; left: string };

const MAX_BUBBLES = 20;
const BUBBLE_INTERVAL = 500;

const Category = () => {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<Post[]>([]);

  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [spiderVisible, setSpiderVisible] = useState(true);
  const [disappearingIds, setDisappearingIds] = useState<number[]>([]);

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [snails, setSnails] = useState<Snail[]>([]);

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
      const newSpiders: Spider[] = [...Array(12)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 90}%`,
        left: `${Math.random() * 90}%`,
        rotate: Math.floor(Math.random() * 360),
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
      const newSnails: Snail[] = [...Array(8)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 80}%`,
      }));
      setSnails(newSnails);
    } else {
      setSnails([]);
    }
  }, [category]);

  // 泡の自動生成（techカテゴリ）
  useEffect(() => {
    if (category !== "tech") return;

    const id = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= MAX_BUBBLES) return prev;
        const newBubble: Bubble = {
          id: Date.now() + Math.random(),
          top: `${Math.random() * 90}%`,
          left: `${Math.random() * 90}%`,
        };
        return [...prev, newBubble];
      });
    }, BUBBLE_INTERVAL);

    return () => clearInterval(id);
  }, [category]);

  // 蜘蛛削除ハンドラ
  const handleClick = (id: number) => {
    setDisappearingIds((prev) => [...prev, id]);
    setTimeout(() => {
      setSpiders((prev) => prev.filter((sp) => sp.id !== id));
    }, 600);
  };

  // カタツムリ削除のハンドラ
  const handleSnailClick = (id: number) => {
    setDisappearingIds((prev) => [...prev, id]);
    setTimeout(() => {
      setSnails((prev) => prev.filter((snail) => snail.id !== id));
      setDisappearingIds((prev) => prev.filter((x) => x !== id));
    }, 600);
  };

  const renderSpiderLayer = () =>
    category === "hobby" &&
    spiderVisible && (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {spiders.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleClick(s.id)}
            aria-label="クモを消す"
            className={`spider pointer-events-auto ${disappearingIds.includes(s.id) ? "spider-disappear" : ""}`}
            style={
              {
                top: s.top,
                left: s.left,
                position: "absolute",
                "--rotate": `${s.rotate}deg`,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              } as React.CSSProperties
            }
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

  // 泡レイヤー
  const renderBubbleLayer = () =>
    category === "tech" && (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {bubbles.map((b) => (
          <img
            key={b.id}
            src="/patterns/bubbles.svg"
            alt=""
            className="bubble"
            style={{ top: b.top, left: b.left }}
            onAnimationEnd={() => {
              setBubbles((prev) => prev.filter((x) => x.id !== b.id));
            }}
          />
        ))}
      </div>
    );

  // カタツムリレイヤー
  const renderSnailLayer = () =>
    category === "other" && (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {snails.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-label="カタツムリを削除"
            className={`snail pointer-events-auto ${disappearingIds.includes(s.id) ? "snail-move" : ""} ${s.isMoved ? "snail-move" : ""}`}
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
          <BackToTopButton className="w-full" />
        </div>
      </div>
    </section>
  );
};

export default Category;

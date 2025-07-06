// app/src/pages/Category.tsx
import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BackToTopButton from '@/components/molecules/BackToTopButton'
import './Category.css'

type Post = { id: number; title: string; content: string; category: string }
type Spider = { id: number; top: string; left: string; rotate: number }
type Bubble = { id: number; top: string; left: string }
type Snail = { id: number; top: string; left: string }

const MAX_BUBBLES = 20
const BUBBLE_INTERVAL = 500

const Category = () => {
  const { category } = useParams<{ category: string }>()
  const [posts, setPosts] = useState<Post[]>([])

  const [spiders, setSpiders] = useState<Spider[]>([])
  const [spiderVisible, setSpiderVisible] = useState(true)

  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [snails, setSnails] = useState<Snail[]>([])

  /* 投稿・装飾初期化 */
  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved && category) {
      const all: Post[] = JSON.parse(saved)
      setPosts(all.filter((p) => p.category === category))
    }

    if (category === 'hobby') {
      const newSpiders: Spider[] = [...Array(12)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 90}%`,
        left: `${Math.random() * 90}%`,
        rotate: Math.floor(Math.random() * 360),
      }))
      setSpiders(newSpiders)
      setSpiderVisible(true)
    } else {
      setSpiders([])
    }

    if (category !== 'tech') {
      setBubbles([])
    }
  }, [category])

  /* 泡の定期生成（tech） */
  useEffect(() => {
    if (category !== 'tech') return

    const id = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= MAX_BUBBLES) return prev
        const newBubble: Bubble = {
          id: Date.now() + Math.random(),
          top: `${Math.random() * 90}%`,
          left: `${Math.random() * 90}%`,
        }
        return [...prev, newBubble]
      })
    }, BUBBLE_INTERVAL)

    return () => clearInterval(id)
  }, [category])

  /* カタツムリ生成（other） */
  useEffect(() => {
    if (category === 'other') {
      const newSnails: Snail[] = [...Array(8)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 80}%`,
      }))
      setSnails(newSnails)
    } else {
      setSnails([])
    }
  }, [category])

  /* 蜘蛛レイヤー */
  const renderSpiderLayer = () =>
    category === 'hobby' && spiderVisible && (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {spiders.map((s) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <img
            key={s.id}
            id={`spider-${s.id}`}
            src="/patterns/spider.svg"
            alt=""
            className="spider pointer-events-auto"
            style={
              {
                top: s.top,
                left: s.left,
                '--rotate': `${s.rotate}deg`,
              } as React.CSSProperties
            }
            onClick={() => {
              // biome-ignore lint/complexity/noForEach: <explanation>
              spiders.forEach((sp) => {
                document
                  .getElementById(`spider-${sp.id}`)
                  ?.classList.add('spider-disappear')
              })
              setTimeout(() => setSpiderVisible(false), 600)
            }}
          />
        ))}
      </div>
    )

  /* 泡レイヤー */
  const renderBubbleLayer = () =>
    category === 'tech' && (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {bubbles.map((b) => (
          <img
            key={b.id}
            id={`bubble-${b.id}`}
            src="/patterns/bubbles.svg"
            alt=""
            className="bubble"
            style={{ top: b.top, left: b.left }}
            onAnimationEnd={() => {
              setBubbles((prev) => prev.filter((x) => x.id !== b.id))
            }}
          />
        ))}
      </div>
    )

  /* カタツムリレイヤー */
  const renderSnailLayer = () =>
    category === 'other' && (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {snails.map((s) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <img
            key={s.id}
            id={`snail-${s.id}`}
            src="/patterns/snail.svg"
            alt=""
            className="snail pointer-events-auto"
            style={{ top: s.top, left: s.left }}
            onMouseEnter={(e) => {
              e.currentTarget.classList.add('snail-move')
            }}
            onClick={() => {
              setSnails((prev) => prev.filter((x) => x.id !== s.id))
            }}
          />
        ))}
      </div>
    )

  const labelMap = { hobby: 'しゅみ', tech: 'テック', other: 'その他' } as const
  const bgMap = {
    hobby: 'bg-[#E1C6F9]',
    tech: 'bg-[#AFEBFF]',
    other: 'bg-[#CCF5B1]',
  } as const

  return (
    <section
      className={`relative min-h-screen p-6 space-y-6 overflow-hidden ${
        bgMap[category as keyof typeof bgMap] ?? 'bg-white'
      }`}
    >
      {/* 背景レイヤー */}
      {renderSpiderLayer()}
      {renderBubbleLayer()}
      {renderSnailLayer()}

      {/* コンテンツ */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold">
          {labelMap[category as keyof typeof labelMap] ?? category} カテゴリの記事
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
                <h2 className="text-xl font-semibold break-words">{post.title}</h2>
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

        <div className="flex justify-center pt-6">
          <BackToTopButton />
        </div>
      </div>
    </section>
  )
}

export default Category

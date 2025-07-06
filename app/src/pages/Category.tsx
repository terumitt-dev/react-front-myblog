// app/src/pages/Category.tsx
import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BackToTopButton from '@/components/molecules/BackToTopButton'
import './Category.css'

type Post = { id: number; title: string; content: string; category: string }

const Category = () => {
  const { category } = useParams<{ category: string }>()
  const [posts, setPosts] = useState<Post[]>([])

  const labelMap = { hobby: 'しゅみ', tech: 'テック', other: 'その他' } as const
  const bgMap = {
    hobby: 'bg-[#E1C6F9]',
    tech: 'bg-[#AFEBFF]',
    other: 'bg-[#CCF5B1]',
  } as const

  // 🕷️ 蜘蛛状態管理
  const [spiders, setSpiders] = useState<
    { id: number; top: string; left: string; rotate: number }[]
  >([])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // 投稿読み込み
    const saved = localStorage.getItem('myblog-posts')
    if (saved && category) {
      const all: Post[] = JSON.parse(saved)
      setPosts(all.filter((p) => p.category === category))
    }

    // 蜘蛛初期化
    if (category === 'hobby') {
      const newSpiders = [...Array(12)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 90}%`,
        left: `${Math.random() * 90}%`,
        rotate: Math.floor(Math.random() * 360),
      }))
      setSpiders(newSpiders)
      setVisible(true)
    } else {
      setSpiders([])
    }
  }, [category])

  // 🕷️ 蜘蛛レイヤー
  const renderSpiderLayer = () => {
    if (category !== 'hobby' || !visible) return null

    return (
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
              spiders.forEach((spider) => {
                const el = document.getElementById(`spider-${spider.id}`)
                if (el) el.classList.add('spider-disappear')
              })
              setTimeout(() => setVisible(false), 600)
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <section
      className={`relative min-h-screen p-6 space-y-6 overflow-hidden ${
        bgMap[category as keyof typeof bgMap] ?? 'bg-white'
      }`}
    >
      {renderSpiderLayer()}

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

        {/* 🆙 修正ポイント */}
        <div className="flex justify-center pt-6 mt-10">
          <BackToTopButton />
        </div>
      </div>
    </section>
  )
}

export default Category

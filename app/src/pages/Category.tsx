// app/src/pages/Category.tsx
import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BackToTopButton from '@/components/molecules/BackToTopButton'

type Post = { id: number; title: string; content: string; category: string }

const Category = () => {
  const { category } = useParams<{ category: string }>()
  const [posts, setPosts] = useState<Post[]>([])

  /* 投稿読み込み */
  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved && category) {
      const all: Post[] = JSON.parse(saved)
      setPosts(all.filter((p) => p.category === category))
    }
  }, [category])

  /* ラベル・背景色 */
  const labelMap = { hobby: 'しゅみ', tech: 'テック', other: 'その他' } as const
  const bgMap   = { hobby: 'bg-[#E1C6F9]', tech: 'bg-[#AFEBFF]', other: 'bg-[#CCF5B1]' } as const

  /* === パターン設定（画像・数・クラス） === */
  const patternConfig: Record<
    string,
    { src: string; count: number; className: string }
  > = {
    hobby: {
      src: '/patterns/spider.svg',
      count: 12,
      className: 'w-10 h-10 animate-spider-move',
    },
    tech: {
      src: '/patterns/bubbles.svg',
      count: 18,
      className: 'w-8 h-8 animate-bubble-pop',
    },
    other: {
      src: '/patterns/snail.svg',
      count: 8,
      className: 'w-12 h-12 animate-snail-crawl',
    },
  }

  /* 背景レイヤーを生成 */
  const renderPatternLayer = () => {
    const conf = patternConfig[category ?? '']
    if (!conf) return null

    return (
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(conf.count)].map((_, i) => (
          <img
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={i}
            src={conf.src}
            alt=""
            className={`absolute opacity-70 ${conf.className}`}
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <section
      className={`relative group min-h-screen p-6 space-y-6 overflow-hidden ${
        bgMap[category as keyof typeof bgMap] ?? 'bg-white'
      }`}
    >
      {/* === 2層目：模様レイヤー === */}
      {renderPatternLayer()}

      {/* === 3層目：コンテンツ === */}
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

        <div className="flex justify-center pt-6">
          <BackToTopButton />
        </div>
      </div>
    </section>
  )
}

export default Category

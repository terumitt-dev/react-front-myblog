// app/src/pages/Top.tsx
import Layout from '@/components/layouts/Layout'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryButtons from '@/components/organisms/CategoryButtons'

type Post = {
  id: number
  title: string
  category: string
}

const Top = () => {
  const [posts, setPosts] = useState<Post[]>([])

  /* 投稿データ読み込み */
  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const normalized = JSON.parse(saved).map((p: any) => ({
        ...p,
        id: Number(p.id),
      }))
      setPosts(normalized)
    }
  }, [])

  const latestArticles = posts.slice(-3).reverse()

  return (
    <Layout>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ヒーロー画像 */}
        <div className="w-full overflow-hidden rounded-xl shadow-lg">
          <img
            src="/top-image.jpg"
            alt="トップ画像"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* カテゴリボタン */}
        <section className="space-y-3">
          <CategoryButtons fullWidth />
        </section>

        {/* 最新記事（グレー背景ボックス） */}
        <section className="space-y-4">
          <div className="bg-[#D9D9D9] rounded-xl p-4 sm:p-6 overflow-hidden">
            <h2 className="text-xl font-semibold text-center mb-4">
              最新記事
            </h2>

            {latestArticles.length === 0 ? (
              <p className="text-center">まだ投稿がありません。</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                {latestArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-xl shadow p-4 flex flex-col justify-between w-full"
                  >
                    <div>
                      <h3 className="font-bold break-words">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 break-words">
                        カテゴリー: {article.category}
                      </p>
                    </div>
                    <Link
                      to={`/posts/${article.id}`}
                      className="mt-4 text-blue-600 hover:underline self-start"
                    >
                      記事を読む →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Top

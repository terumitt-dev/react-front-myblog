// app/src/pages/Top.tsx
// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import CategoryButtons from '@/components/organisms/CategoryButtons'

// type Post = {
//   id: number
//   title: string
//   category: string
//   content?: string
// }

// const Top = () => {
//   const [posts, setPosts] = useState<Post[]>([])

//   useEffect(() => {
//     const saved = localStorage.getItem('myblog-posts')
//     if (saved) {
//       setPosts(JSON.parse(saved))
//     }
//   }, [])

//   // 最新記事3件だけ抽出（投稿が多い場合を想定）
//   const latestArticles = posts
//     .slice(-3)
//     .reverse() // 新しい順に並べ替え

//   return (
//     <div>
//       <img src="/top-image.jpg" alt="トップ画像" style={{ width: '100%', height: 'auto' }} />

//       <h2>カテゴリー一覧</h2>
//       <CategoryButtons />

//       <h2>最新記事</h2>
//       {latestArticles.length === 0 ? (
//         <p>まだ投稿がありません。</p>
//       ) : (
//         <ul style={{ paddingLeft: '1rem' }}>
//           {latestArticles.map((article) => (
//             <li key={article.id}>
//               <Link to={`/posts/${article.id}`}>
//                 {article.title}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   )
// }

// export default Top

// app/src/pages/Top.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryButtons from '@/components/organisms/CategoryButtons'

type Post = {
  id: number
  title: string
  category: string
  content?: string
}

const Top = () => {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved) {
      const parsed = JSON.parse(saved)
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const normalized = parsed.map((p: any) => ({
        ...p,
        id: Number(p.id), // 念のため数値化
      }))
      setPosts(normalized)
    }
  }, [])

  const latestArticles = posts.slice(-3).reverse()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* ヒーロー画像 */}
      <div className="w-full overflow-hidden rounded-xl shadow-lg">
        <img
          src="/top-image.jpg"
          alt="トップ画像"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* カテゴリ一覧 */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">カテゴリー一覧</h2>
        <CategoryButtons />
      </section>

      {/* 最新記事 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">最新記事</h2>
        {latestArticles.length === 0 ? (
          <p>まだ投稿がありません。</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {latestArticles.map((article) => (
              <li
                key={article.id}
                className="border rounded-xl p-4 shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold">{article.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  カテゴリー: <span>{article.category}</span>
                </p>
                <Link
                  to={`/posts/${article.id}`}
                  className="inline-block mt-3 text-blue-600 hover:underline"
                >
                  記事を読む →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Top
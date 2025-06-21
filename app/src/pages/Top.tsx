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
      setPosts(JSON.parse(saved))
    }
  }, [])

  // 最新記事3件だけ抽出（投稿が多い場合を想定）
  const latestArticles = posts
    .slice(-3)
    .reverse() // 新しい順に並べ替え

  return (
    <div>
      <img src="/top-image.jpg" alt="トップ画像" style={{ width: '100%', height: 'auto' }} />

      <h2>カテゴリー一覧</h2>
      <CategoryButtons />

      <h2>最新記事</h2>
      {latestArticles.length === 0 ? (
        <p>まだ投稿がありません。</p>
      ) : (
        <ul style={{ paddingLeft: '1rem' }}>
          {latestArticles.map((article) => (
            <li key={article.id}>
              <Link to={`/posts/${article.id}`}>
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Top

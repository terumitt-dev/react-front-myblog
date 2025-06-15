// app/src/pages/Top.tsx
import { Link } from 'react-router-dom'
import CategoryButtons from '@/components/organisms/CategoryButtons'

const Top = () => {
  const latestArticles = [
    {
      id: 1,
      title: '趣味で始めたギターの話',
      category: 'hobby',
    },
    {
      id: 2,
      title: 'Reactの最適化まとめ',
      category: 'tech',
    },
    {
      id: 3,
      title: '雑記：最近の気づきメモ',
      category: 'other',
    },
  ]

  return (
    <div>
      <img src="/top-image.jpg" alt="トップ画像" style={{ width: '100%', height: 'auto' }} />

      <h2>カテゴリー一覧</h2>
      <CategoryButtons />

      <h2>最新記事</h2>
      <ul style={{ paddingLeft: '1rem' }}>
        {latestArticles.map((article) => (
          <li key={article.id}>
            <Link to={`/posts/${article.id}`}>
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Top

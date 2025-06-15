// app/src/pages/category/Other.tsx
import { Link } from 'react-router-dom'

const Other = () => {
  const articles = [
    { id: 7, title: '日記：雨の日の朝' },
    { id: 8, title: 'ただのメモ書き' },
    { id: 9, title: '昔話：初めての失敗' },
  ]

  return (
    <div>
      <h1>その他 カテゴリーの記事</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <Link to={`/posts/${article.id}`}>{article.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Other

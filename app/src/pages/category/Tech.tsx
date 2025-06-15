// app/src/pages/category/Tech.tsx
import { Link } from 'react-router-dom'

const Tech = () => {
  const articles = [
    { id: 4, title: 'ReactのuseEffectまとめ' },
    { id: 5, title: 'Vite入門ガイド' },
    { id: 6, title: 'GitHub Actions超入門' },
  ]

  return (
    <div>
      <h1>テック カテゴリーの記事</h1>
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

export default Tech

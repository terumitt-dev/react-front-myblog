// app/src/pages/category/Tech.tsx
import { posts } from '@/data/posts'
import { Link } from 'react-router-dom'

const Tech = () => {
  const techPosts = posts.filter((post) => post.category === 'tech')

  return (
    <div>
      <h1>しゅみ カテゴリーの記事</h1>
      <ul>
        {techPosts.map((article) => (
          <li key={article.id}>
            <Link to={`/posts/${article.id}`}>{article.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Tech

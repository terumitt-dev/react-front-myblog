// app/src/pages/category/Other.tsx
import { posts } from '@/data/posts'
import { Link } from 'react-router-dom'

const Other = () => {
  const otherPosts = posts.filter((post) => post.category === 'Other')

  return (
    <div className="min-h-screen bg-[#CCF5B1] p-8">
      <h1>その他 カテゴリーの記事</h1>
      <ul>
        {otherPosts.map((article) => (
          <li key={article.id}>
            <Link to={`/posts/${article.id}`}>{article.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Other

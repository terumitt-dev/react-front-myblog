// app/src/pages/category/Hobby.tsx
import { posts } from '@/data/posts'
import { Link } from 'react-router-dom'

const Hobby = () => {
  const hobbyPosts = posts.filter((post) => post.category === 'hobby')

  return (
    <div className="min-h-screen bg-[#E1C6F9] p-8">
      <h1>しゅみ カテゴリーの記事</h1>
      <ul>
        {hobbyPosts.map((article) => (
          <li key={article.id}>
            <Link to={`/posts/${article.id}`}>{article.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Hobby

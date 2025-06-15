// app/src/pages/Category.tsx
import { useParams, Link } from 'react-router-dom'
import { posts } from '@/data/posts'

const Category = () => {
  const { category } = useParams<{ category: string }>()

  const filteredPosts = posts.filter((post) => post.category === category)

  return (
    <div>
      <h1>「{category}」カテゴリの記事一覧</h1>

      {filteredPosts.length === 0 ? (
        <p>該当する記事がありません。</p>
      ) : (
        <ul>
          {filteredPosts.map((post) => (
            <li key={post.id}>
              <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Category

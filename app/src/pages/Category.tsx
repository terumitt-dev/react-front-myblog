// app/src/pages/Category.tsx
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

type Post = {
  id: number
  title: string
  content: string
  category: string
}

const Category = () => {
  const { category } = useParams<{ category: string }>()
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved && category) {
      const allPosts: Post[] = JSON.parse(saved)
      const filtered = allPosts.filter((p) => p.category === category)
      setPosts(filtered)
    }
  }, [category])

  const getCategoryLabel = (key: string) => {
    switch (key) {
      case 'tech':
        return '技術';
      case 'hobby':
        return '趣味';
      case 'other':
        return 'その他';
      default:
        return key;
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        {getCategoryLabel(category || '')} カテゴリの記事
      </h1>

      {posts.length === 0 ? (
        <p>このカテゴリにはまだ投稿がありません。</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="p-4 border rounded shadow">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-700">{post.content.slice(0, 100)}...</p>
              <a
                href={`/posts/${post.id}`}
                className="text-blue-600 hover:underline block mt-2"
              >
                詳細を見る →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Category

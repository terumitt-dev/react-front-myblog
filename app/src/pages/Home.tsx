// app/src/pages/Home.tsx
import { useEffect, useState } from 'react'

type Post = {
  id: number
  title: string
  content: string
  category: string
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved) {
      setPosts(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">投稿一覧</h1>

      {posts.length === 0 ? (
        <p>投稿はまだありません。</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="p-4 border rounded shadow">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-700">{post.content}</p>
              <p className="text-sm text-gray-500">カテゴリー：{post.category}</p>
              <a
                href={`/posts/${post.id}`}
                className="text-blue-600 hover:underline mt-2 inline-block"
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

export default Home

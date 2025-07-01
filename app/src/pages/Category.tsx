// app/src/pages/Category.tsx
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BackToTopButton from '@/components/molecules/BackToTopButton'

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
      case 'hobby':
        return 'しゅみ'
      case 'tech':
        return 'テック'
      case 'other':
        return 'その他'
      default:
        return key
    }
  }

  const getCategoryBgColor = (key: string) => {
    switch (key) {
      case 'hobby':
        return 'bg-[#E1C6F9]'
      case 'tech':
        return 'bg-[#AFEBFF]'
      case 'other':
        return 'bg-[#CCF5B1]'
      default:
        return 'bg-white'
    }
  }

  return (
  <section className={`min-h-screen p-6 space-y-6 ${getCategoryBgColor(category || '')}`}>
    <h1 className="text-2xl font-bold">
      {getCategoryLabel(category || '')} カテゴリの記事
    </h1>

    {posts.length === 0 ? (
      <p>このカテゴリにはまだ投稿がありません。</p>
    ) : (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-700 mt-2">
              {post.content.slice(0, 100)}...
            </p>
            <a
              href={`/posts/${post.id}`}
              className="mt-3 inline-block text-blue-600 hover:underline"
            >
              詳細を見る →
            </a>
          </div>
        ))}
      </div>
    )}
    <div className="flex justify-center pt-6">
      <BackToTopButton />
    </div>
  </section>
  )
}

export default Category

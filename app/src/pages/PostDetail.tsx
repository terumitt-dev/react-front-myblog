// app/src/pages/PostDetail.tsx
import Layout from '@/components/layouts/Layout'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import CommentForm from '@/components/organisms/CommentForm'
import BackToTopButton from '@/components/molecules/BackToTopButton'

type Post = {
  id: number
  title: string
  content: string
  category: string
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<{ user: string; content: string }[]>([])
  const [isWriting, setIsWriting] = useState(false)

  /* 投稿取得 */
  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved) {
      const posts: Post[] = JSON.parse(saved)
      setPost(posts.find((p) => p.id === Number(id)) ?? null)
    }
  }, [id])

  /* コメント送信 */
  const handleCommentSubmit = (user: string, content: string) => {
    setComments([...comments, { user, content }])
    setIsWriting(false)
  }

  if (!post) return <div className="p-6">記事が見つかりませんでした。</div>

  return (
    <Layout>
      {/* グレー背景大枠 */}
      <div className="bg-[#D9D9D9] max-w-5xl mx-auto p-8 rounded-xl">
        {/* 2カラム：左=記事, 右=コメント一覧 */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* 記事カード */}
          <article className="bg-white rounded-xl shadow p-6 md:col-span-2 space-y-6">
            <header>
              <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
              <span className="inline-block text-sm font-semibold px-3 py-1 rounded bg-gray-200">
                {post.category}
              </span>
              <hr className="mt-4" />
            </header>

            <div className="leading-relaxed whitespace-pre-line">{post.content}</div>
          </article>

          {/* コメント一覧カード */}
          <section className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">コメント一覧</h2>

            {comments.length === 0 ? (
              <p className="text-gray-600">コメントはまだありません。</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((c, i) => (
                  <li key={i} className="bg-gray-50 p-3 rounded shadow-sm">
                    <strong>{c.user}</strong>：{c.content}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* 下部ボタン（枠の外） */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() => setIsWriting(true)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            コメントする
          </button>
          <div className="flex-1 flex justify-center">
            <BackToTopButton />
          </div>
        </div>

        {/* コメントフォーム */}
        {isWriting && (
          <div className="mt-6 bg-white p-6 rounded-xl shadow">
            <CommentForm
              onSubmit={handleCommentSubmit}
              onCancel={() => setIsWriting(false)}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}

export default PostDetail

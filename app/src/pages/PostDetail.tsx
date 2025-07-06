// app/src/pages/PostDetail.tsx
import Layout from '@/components/layouts/Layout'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CommentForm from '@/components/organisms/CommentForm'
import BackToTopButton from '@/components/molecules/BackToTopButton'

type Post = {
  id: number
  title: string
  content: string
  category: string
}

type Comment = {
  id: number
  user: string
  content: string
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const postId = Number(id)

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isWriting, setIsWriting] = useState(false)

  const [openCommentIds, setOpenCommentIds] = useState<number[]>([])

  /* 投稿とコメントを読み込む */
  useEffect(() => {
    const savedPosts = localStorage.getItem('myblog-posts')
    if (savedPosts) {
      const posts: Post[] = JSON.parse(savedPosts) as Post[]
      setPost(posts.find((p) => p.id === postId) ?? null)
    }

    const storedComments = localStorage.getItem(`myblog-comments-${postId}`)
    if (storedComments) {
      setComments(JSON.parse(storedComments) as Comment[])
    }
  }, [postId])

  /* コメント送信 */
  const handleCommentSubmit = (user: string, content: string) => {
    if (!user.trim() || !content.trim()) return
    const newComment: Comment = {
      id: Date.now(),
      user,
      content,
    }
    const updated = [...comments, newComment]
    setComments(updated)
    localStorage.setItem(`myblog-comments-${postId}`, JSON.stringify(updated))
    setIsWriting(false)
  }

  /* コメントの開閉トグル */
  const toggleComment = (commentId: number) => {
    setOpenCommentIds((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    )
  }

  if (!post) return <div className="p-6">記事が見つかりませんでした。</div>

  return (
    <Layout>
      <div className="bg-[#D9D9D9] max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 rounded-xl overflow-hidden">
        {/* 2カラム */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* ===== 記事エリア ===== */}
          <article className="w-full bg-white rounded-xl shadow p-6 md:col-span-2 space-y-6">
            <header>
              <h1 className="text-3xl font-bold mb-3 break-words">{post.title}</h1>
              <span className="inline-block text-sm font-semibold px-3 py-1 rounded bg-gray-200">
                {post.category}
              </span>
              <hr className="mt-4" />
            </header>
            <div className="leading-relaxed whitespace-pre-line break-words">{post.content}</div>
          </article>

          {/* ===== コメント一覧 ===== */}
          <section className="w-full bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">コメント一覧</h2>

            {comments.length === 0 ? (
              <p className="text-gray-600">コメントはまだありません。</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => {
                  const isOpen = openCommentIds.includes(c.id)
                  return (
                    <div
                      key={c.id}
                      // biome-ignore lint/a11y/useSemanticElements: <explanation>
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleComment(c.id)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleComment(c.id)}
                      className="cursor-pointer bg-gray-50 p-4 rounded shadow-sm hover:bg-gray-100 transition text-sm break-words"
                    >
                      <p className="font-semibold">{c.user}</p>
                      <p className="text-gray-700 mt-1">
                        {isOpen
                          ? c.content
                          : c.content.length > 30
                            ? `${c.content.slice(0, 30)}...`
                            : c.content}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* ===== ボタン列 ===== */}
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

        {/* ===== コメントフォーム ===== */}
        {isWriting && (
          <div className="mt-3 bg-white p-3 rounded-xl shadow">
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

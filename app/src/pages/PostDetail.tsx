// app/src/pages/PostDetail.tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { posts } from '@/data/posts'
import CommentForm from '@/components/organisms/CommentForm'

const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const post = posts.find((p) => p.id === Number(id))

  const [comments, setComments] = useState<{ user: string; content: string }[]>([])
  const [isWriting, setIsWriting] = useState(false)

  if (!post) {
    return <div>記事が見つかりませんでした。</div>
  }

  const handleCommentSubmit = (userName: string, comment: string) => {
    setComments([...comments, { user: userName, content: comment }])
    setIsWriting(false)
  }

  const handleCancel = () => {
    setIsWriting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-gray-700">{post.content}</p>
        <p className="text-sm text-gray-500">
          <strong>カテゴリー：</strong>{post.category}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">コメント一覧</h2>
        {comments.length === 0 ? (
          <p>コメントはまだありません。</p>
        ) : (
          <ul className="space-y-2">
            {comments.map((c, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <li key={i} className="p-2 border rounded">
                <strong>{c.user}</strong>: {c.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {isWriting ? (
          <CommentForm onSubmit={handleCommentSubmit} onCancel={handleCancel} />
        ) : (
          // biome-ignore lint/a11y/useButtonType: <explanation>
          <button
            onClick={() => setIsWriting(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            コメントを書く
          </button>
        )}
      </div>
    </div>
  )
}

export default PostDetail

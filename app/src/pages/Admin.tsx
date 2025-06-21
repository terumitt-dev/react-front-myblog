// app/src/pages/Admin.tsx
import { useEffect, useState } from 'react'

type Post = {
  id: number
  title: string
  content: string
  category: string
  createdAt: string
}

const Admin = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tech')
  const [posts, setPosts] = useState<Post[]>([])
  const [editingPostId, setEditingPostId] = useState<number | null>(null)

  // localStorage から投稿を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved) {
      setPosts(JSON.parse(saved))
    }
  }, [])

  // 投稿を追加
  const handleAddPost = () => {
    if (!title.trim() || !content.trim()) return

    const newPost: Post = {
      id: Date.now(),
      title,
      content,
      category,
      createdAt: new Date().toISOString(),
    }

    const updatedPosts = [...posts, newPost]
    setPosts(updatedPosts)
    localStorage.setItem('myblog-posts', JSON.stringify(updatedPosts))
    resetForm()
  }

  // 投稿を更新
  const handleUpdatePost = () => {
    if (!editingPostId) return

    const updatedPosts = posts.map((post) =>
      post.id === editingPostId
        ? { ...post, title, content, category }
        : post
    )

    setPosts(updatedPosts)
    localStorage.setItem('myblog-posts', JSON.stringify(updatedPosts))
    resetForm()
  }

  // 編集開始
  const startEdit = (post: Post) => {
    setEditingPostId(post.id)
    setTitle(post.title)
    setContent(post.content)
    setCategory(post.category)
  }

  // 投稿を削除
  const handleDelete = (id: number) => {
    const updatedPosts = posts.filter((post) => post.id !== id)
    setPosts(updatedPosts)
    localStorage.setItem('myblog-posts', JSON.stringify(updatedPosts))
    if (editingPostId === id) resetForm() // 編集中の投稿を削除した場合もリセット
  }

  // 入力リセット
  const resetForm = () => {
    setEditingPostId(null)
    setTitle('')
    setContent('')
    setCategory('tech')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">投稿管理（Admin）</h1>

      {/* 投稿フォーム */}
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="border p-2 w-full"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="本文"
          className="border p-2 w-full"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2"
        >
          <option value="tech">Tech</option>
          <option value="hobby">Hobby</option>
          <option value="other">Other</option>
        </select>

        <div className="flex gap-4">
          {editingPostId ? (
            <>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button
                onClick={handleUpdatePost}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                更新
              </button>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                キャンセル
              </button>
            </>
          ) : (
            // biome-ignore lint/a11y/useButtonType: <explanation> 
            <button
              onClick={handleAddPost}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              投稿を追加
            </button>
          )}
        </div>
      </div>

      {/* 投稿一覧 */}
      <div>
        <h2 className="text-xl font-semibold mt-6">現在の投稿一覧</h2>
        {posts.length === 0 ? (
          <p>まだ投稿がありません。</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {posts.map((post) => (
              <li key={post.id} className="border p-3 rounded space-y-1">
                <div>
                  <strong>{post.title}</strong>（{post.category}）
                </div>
                <div className="text-sm text-gray-500">
                  投稿日: {new Date(post.createdAt).toLocaleString()}
                </div>
                <div className="text-gray-700">{post.content}</div>
                <div className="flex gap-4 mt-2">
                  <a
                    href={`/posts/${post.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    記事を確認 →
                  </a>
                  {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                  <button
                    onClick={() => startEdit(post)}
                    className="text-yellow-600 hover:underline"
                  >
                    編集
                  </button>
                  {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Admin

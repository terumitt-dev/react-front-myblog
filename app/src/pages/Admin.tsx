// app/src/pages/Admin.tsx
import Layout from '@/components/layouts/Layout'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LogoutButton from '@/components/molecules/LogoutButton'

type Post = {
  id: number
  title: string
  content: string
  category: string
  createdAt: string
}

const Admin = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tech')
  const [posts, setPosts] = useState<Post[]>([])
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [error, setError] = useState('')

  // 投稿データ読み込み
  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved) {
      setPosts(JSON.parse(saved))
    }
  }, [])

  const saveToLocalStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts)
    localStorage.setItem('myblog-posts', JSON.stringify(updatedPosts))
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setCategory('tech')
    setEditingPostId(null)
    setError('')
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      setError('タイトルと本文は必須です。')
      return
    }

    if (editingPostId !== null) {
      const updated = posts.map((p) =>
        p.id === editingPostId ? { ...p, title, content, category } : p
      )
      saveToLocalStorage(updated)
    } else {
      const newPost: Post = {
        id: Date.now(),
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
      }
      saveToLocalStorage([...posts, newPost])
    }

    resetForm()
  }

  const handleDelete = (id: number) => {
    const updated = posts.filter((p) => p.id !== id)
    saveToLocalStorage(updated)
  }

  const handleEdit = (post: Post) => {
    setTitle(post.title)
    setContent(post.content)
    setCategory(post.category)
    setEditingPostId(post.id)
    setError('')
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">投稿管理（Admin）</h1>
          <div>
            <LogoutButton onClick={handleLogout} />
          </div>
        </div>

        {/* 投稿フォーム */}
        <div className="bg-gray-200 rounded-xl p-6">
          <div className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}

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
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded text-white ${editingPostId !== null ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {editingPostId !== null ? '更新する' : '投稿を追加'}
              </button>

              {editingPostId !== null && (
                // biome-ignore lint/a11y/useButtonType: <explanation>
                <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 投稿一覧 */}
        <div className="bg-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold">現在の投稿一覧</h2>
          {posts.length === 0 ? (
            <p>まだ投稿がありません。</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {posts.map((post) => (
                <li key={post.id} className="border p-3 rounded space-y-1 bg-white">
                  <div>
                    <strong>{post.title}</strong>（{post.category}）
                    <div className="text-xs text-gray-500">
                      投稿日: {new Date(post.createdAt).toLocaleString()}
                    </div>
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
                      onClick={() => handleEdit(post)}
                      className="text-green-600 hover:underline"
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
    </Layout> 
  )
}

export default Admin

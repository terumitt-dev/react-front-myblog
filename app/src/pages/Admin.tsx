import { useEffect, useState } from 'react'

type Post = {
  id: number
  title: string
  content: string
  category: string
}

const Admin = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tech')
  const [posts, setPosts] = useState<Post[]>([])

  // 投稿をlocalStorageから読み込む
  useEffect(() => {
    const saved = localStorage.getItem('myblog-posts')
    if (saved) {
      setPosts(JSON.parse(saved))
    }
  }, [])

  // 投稿を追加してlocalStorageに保存
  const handleAddPost = () => {
    if (!title.trim() || !content.trim()) return

    const newPost: Post = {
      id: posts.length + 1,
      title,
      content,
      category,
    }

    const updatedPosts = [...posts, newPost]
    setPosts(updatedPosts)
    localStorage.setItem('myblog-posts', JSON.stringify(updatedPosts))

    setTitle('')
    setContent('')
    setCategory('tech')
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">投稿管理（Admin）</h1>

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
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={handleAddPost}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          投稿を追加
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6">現在の投稿一覧</h2>
        <ul className="space-y-2 mt-2">
          {posts.map((post) => (
            <li key={post.id} className="border p-3 rounded">
              <strong>{post.title}</strong>（{post.category}）<br />
              <span className="text-gray-700">{post.content}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Admin

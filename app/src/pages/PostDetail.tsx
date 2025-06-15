// app/src/pages/PostDetail.tsx
import { useParams } from 'react-router-dom'
import { posts } from '@/data/posts'

const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const post = posts.find((p) => p.id === Number(id))

  if (!post) {
    return <div>記事が見つかりませんでした。</div>
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p><strong>カテゴリー：</strong>{post.category}</p>
    </div>
  )
}

export default PostDetail

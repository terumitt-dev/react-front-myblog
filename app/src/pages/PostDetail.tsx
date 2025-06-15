// app/src/pages/PostDetail.tsx
import { useParams } from 'react-router-dom'

const dummyArticles = [
  { id: '1', title: 'ギターはじめました', body: 'ギターを始めたきっかけと練習方法について書きます。' },
  { id: '2', title: 'ReactのuseEffectまとめ', body: 'useEffectの使い方を初心者向けにまとめました。' },
  { id: '3', title: '日記：雨の日の朝', body: '雨の日にふと感じたことをメモしておきます。' },
]

const PostDetail = () => {
  const { id } = useParams()

  const post = dummyArticles.find((article) => article.id === id)

  if (!post) {
    return <div>記事が見つかりませんでした。</div>
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  )
}

export default PostDetail

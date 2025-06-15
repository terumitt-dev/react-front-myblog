// app/src/pages/CategoryPage.tsx
import { useParams } from 'react-router-dom'

const CategoryPage = () => {
  const { category } = useParams()

  return (
    <div>
      <h1>カテゴリー: {category}</h1>
      <p>ここに {category} の記事が表示されます。</p>
    </div>
  )
}

export default CategoryPage

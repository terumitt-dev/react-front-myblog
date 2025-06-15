// app/src/pages/category/Tech.tsx
const Tech = () => {
  const articles = [
    { id: 4, title: 'ReactのuseEffectまとめ' },
    { id: 5, title: 'Vite入門ガイド' },
    { id: 6, title: 'GitHub Actions超入門' },
  ]

  return (
    <div>
      <h1>テック カテゴリーの記事</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default Tech

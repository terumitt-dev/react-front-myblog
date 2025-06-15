// app/src/pages/category/Hobby.tsx
const Hobby = () => {
  const articles = [
    { id: 1, title: 'ギターはじめました' },
    { id: 2, title: '週末キャンプのススメ' },
    { id: 3, title: '映画レビュー：君の名は' },
  ]

  return (
    <div>
      <h1>しゅみ カテゴリーの記事</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>{article.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default Hobby

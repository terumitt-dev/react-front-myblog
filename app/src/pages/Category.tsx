// app/src/pages/Category.tsx
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import { useParams, Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import BackToTop from '../components/BackToTop'
import './Category.css'

type Spider = {
  id: number
  left: number
  top: number
}

const Category = () => {
  const { category } = useParams()
  const [spiderVisible, setSpiderVisible] = useState(true)
  const [disappearingIds, setDisappearingIds] = useState<number[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null) // タイマー用refを追加

  const generateSpiders = (): Spider[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: Math.random() * 90,
      top: Math.random() * 80,
    }))
  }

  const [spiders, setSpiders] = useState<Spider[]>(generateSpiders())

  useEffect(() => {
    if (category === 'しゅみ') {
      setSpiders(generateSpiders())
      setSpiderVisible(true)
    }
  }, [category])

  useEffect(() => {
    return () => {
      // クリーンアップ処理でタイマーを解除
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleSpiderClick = () => {
    setDisappearingIds(spiders.map((sp) => sp.id))
    timerRef.current = setTimeout(() => {
      setSpiderVisible(false)
      setDisappearingIds([])
    }, 600)
  }

  return (
    <div className="category-page">
      <h2>{category} のページ</h2>

      {category === 'しゅみ' && spiderVisible && (
        <div className="spider-container">
          {spiders.map((spider) => (
            <img
              key={spider.id}
              src="/spider.png"
              alt="spider"
              className={`spider ${disappearingIds.includes(spider.id) ? 'disappear' : ''}`}
              style={{ left: `${spider.left}%`, top: `${spider.top}%` }}
              onClick={handleSpiderClick}
            />
          ))}
        </div>
      )}

      <p>このカテゴリに関連する記事一覧を表示する予定です。</p>

      <Link to="/">トップページへ戻る</Link>
      <BackToTop />
    </div>
  )
}

export default Category
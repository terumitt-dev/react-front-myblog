// app/src/components/utils/ResettableErrorBoundary.tsx
import { useState } from "react"
import { ErrorBoundary } from "./ErrorBoundary"

export function ResettableErrorBoundary({
  children,
}: {
  children: React.ReactNode
}) {
  const [key, setKey] = useState(0)

  const handleReset = () => setKey(prev => prev + 1)

  return (
    <ErrorBoundary
      key={key}
      fallback={
        <div className="p-4 text-red-600">
          <h2 className="text-xl font-bold">エラーが発生しました</h2>
          <p className="mb-4">もう一度お試しください。</p>
          {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={handleReset}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            やり直す
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

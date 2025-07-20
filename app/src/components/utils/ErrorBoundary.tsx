// app/src/components/utils/ErrorBoundary.tsx
// biome-ignore lint/style/useImportType: <explanation>
import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary caught an error:", error, info)
    // エラーを Sentry などに送信したい場合はここに記述
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: "2rem", color: "red" }}>
          <h2>予期せぬエラーが発生しました。</h2>
          <p>ページを再読み込みするか、しばらくしてからお試しください。</p>
        </div>
      )
    }

    return this.props.children
  }
}

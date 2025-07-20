// app/src/components/utils/ErrorBoundary.tsx
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

    this.resetError = this.resetError.bind(this)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary caught an error:", error)
    console.error("Error info:", info)
  }

  resetError() {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: "2rem", color: "red" }}>
            <h2>予期せぬエラーが発生しました。</h2>
            <p>ページを再読み込みするか、しばらくしてからお試しください。</p>
            {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
              style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
              onClick={this.resetError}
            >
              やり直す
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

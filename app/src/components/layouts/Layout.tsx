// app/src/components/layouts/Layout.tsx
import type { ReactNode } from 'react'
import Header from '../organisms/Header'

type Props = {
  children: ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4161EC] to-[#BC7AF2] text-gray-800 p-8">
      <Header />
      {children}
    </div>
  )
}

export default Layout

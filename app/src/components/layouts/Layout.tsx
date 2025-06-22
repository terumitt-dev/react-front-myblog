// app/src/components/layouts/Layout.tsx
import type { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4161EC] to-[#BC7AF2] text-gray-900">
      {children}
    </div>
  )
}

export default Layout

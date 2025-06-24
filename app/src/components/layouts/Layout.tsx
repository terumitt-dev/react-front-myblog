// app/src/components/layouts/Layout.tsx
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

// const Layout = ({ children }: Props) => {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#4161EC] to-[#BC7AF2] text-gray-800">
//       {children}
//     </div>
//   )
// }

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4161EC] to-[#BC7AF2] text-gray-800 pt-8">
      {children}
    </div>
  )
}

export default Layout

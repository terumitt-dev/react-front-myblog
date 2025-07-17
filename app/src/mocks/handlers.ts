// // app/src/mocks/handlers.ts
// rest.post('/api/login', async (req, res, ctx) => {
//   const { email, password } = await req.json()

//   // 任意の条件でOKに
//   if (email === 'admin@example.com' && password === 'password') {
//     return res(ctx.status(200), ctx.json({ token: 'fake-jwt-token' }))
//   } else {
//     return res(ctx.status(401), ctx.json({ error: '認証失敗' }))
//   }
// })


// app/src/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/posts', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, title: 'Mock Post 1', content: 'これはモックの投稿です。' },
        { id: 2, title: 'Mock Post 2', content: 'もう一つのモック投稿です。' },
      ])
    )
  }),

  rest.post('/api/comments', (_req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ message: 'コメントが投稿されました（モック）' })
    )
  }),

  // 認証モック（オプション：MSWで仮認証を置き換える場合）
  rest.post('/api/login', async (req, res, ctx) => {
    const { email, password } = await req.json()
    const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD

    if (email === devEmail && password === devPassword) {
      return res(ctx.status(200), ctx.json({ token: 'mock-token' }))
    }

    return res(ctx.status(401), ctx.json({ message: '認証に失敗しました' }))
  }),
]

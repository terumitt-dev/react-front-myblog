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
]

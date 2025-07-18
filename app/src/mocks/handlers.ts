// app/src/mocks/handlers.ts
/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: <explanation> */
import { rest } from 'msw' // ✅ 修正！

export const handlers = [
  rest.get('/api/posts', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([{ id: 1, title: 'Mock Post', body: 'This is a mock' }])
    )
  }),
]

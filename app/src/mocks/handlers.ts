// app/src/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.post('/api/login', async (req, res, ctx) => {
    const { email, password } = await req.json()

    if (email === 'admin@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({ user: { name: 'admin', token: 'mock-token' } })
      )
    } else {
      return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }))
    }
  })
]

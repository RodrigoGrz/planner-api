import { app } from '@/infra/app'

vi.hoisted(() => {
  process.env.NODE_ENV = 'production'
  process.env.MAIL_USER = 'mail-user'
  process.env.MAIL_PASS = 'mail-pass'
})

describe('Swagger in production (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /docs returns 404 in production', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs' })

    expect(response.statusCode).toBe(404)
  })

  test('[GET] /docs/json returns 404 in production', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })

    expect(response.statusCode).toBe(404)
  })
})

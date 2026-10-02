import { app } from '@/infra/app'

describe('Documentation UI (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /docs', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs' })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
  })

  test('[GET] /docs/json', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual(
      expect.objectContaining({ openapi: '3.0.0' }),
    )
  })

  test('[GET] /docs/static with path traversal', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/static/%2e%2e/%2e%2e/package.json',
    })

    expect(response.statusCode).not.toBe(200)
    expect(response.body).not.toContain('"dependencies"')
  })
})

import { app } from '@/infra/app'

vi.hoisted(() => {
  process.env.CORS_ORIGINS = 'https://app.planner.com'
})

describe('CORS (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[OPTIONS] /travelers/auth allows a configured origin', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/travelers/auth',
      headers: {
        origin: 'https://app.planner.com',
        'access-control-request-method': 'POST',
      },
    })

    expect(response.headers['access-control-allow-origin']).toBe(
      'https://app.planner.com',
    )
  })

  test('[OPTIONS] /travelers/auth does not allow other origins', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/travelers/auth',
      headers: {
        origin: 'https://evil.com',
        'access-control-request-method': 'POST',
      },
    })

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  test('[POST] /travelers/auth does not allow credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/travelers/auth',
      headers: { origin: 'https://app.planner.com' },
      payload: { email: 'nobody@planner.com', password: '12345678' },
    })

    expect(response.headers['access-control-allow-credentials']).toBeUndefined()
  })
})

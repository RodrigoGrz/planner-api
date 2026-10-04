import { app } from '@/infra/app'
import { randomUUID } from 'node:crypto'

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

  test('[OPTIONS] /sessions allows a configured origin', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/sessions',
      headers: {
        origin: 'https://app.planner.com',
        'access-control-request-method': 'POST',
      },
    })

    expect(response.headers['access-control-allow-origin']).toBe(
      'https://app.planner.com',
    )
  })

  test('[OPTIONS] /sessions does not allow other origins', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/sessions',
      headers: {
        origin: 'https://evil.com',
        'access-control-request-method': 'POST',
      },
    })

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  test('[POST] /sessions does not allow credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/sessions',
      headers: { origin: 'https://app.planner.com' },
      payload: { email: 'nobody@planner.com', password: '12345678' },
    })

    expect(response.headers['access-control-allow-credentials']).toBeUndefined()
  })

  test('[OPTIONS] /trips/:tripId/cover-image allows PUT from a configured origin', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: `/trips/${randomUUID()}/cover-image`,
      headers: {
        origin: 'https://app.planner.com',
        'access-control-request-method': 'PUT',
      },
    })

    expect(response.headers['access-control-allow-methods']).toContain('PUT')
  })

  test('[OPTIONS] /trips/:tripId allows DELETE from a configured origin', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: `/trips/${randomUUID()}`,
      headers: {
        origin: 'https://app.planner.com',
        'access-control-request-method': 'DELETE',
      },
    })

    expect(response.headers['access-control-allow-methods']).toContain('DELETE')
  })
})

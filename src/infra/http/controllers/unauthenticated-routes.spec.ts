import { env } from '@/env'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createHmac, randomUUID } from 'node:crypto'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

const protectedRoutes = [
  ['GET', `/trips/${randomUUID()}`],
  ['POST', '/trips'],
  ['POST', `/trips/${randomUUID()}/links`],
  ['POST', `/trips/${randomUUID()}/activities`],
  ['GET', `/trips/${randomUUID()}/links`],
  ['GET', `/trips/${randomUUID()}/activities`],
  ['GET', `/trips/${randomUUID()}/participants`],
  ['GET', '/me/trips'],
  ['GET', '/me/trips/next'],
  ['PUT', `/trips/${randomUUID()}`],
  ['PUT', `/trips/${randomUUID()}/cover-image`],
  ['DELETE', `/trips/${randomUUID()}`],
  ['DELETE', `/trips/${randomUUID()}/links/${randomUUID()}`],
  ['DELETE', `/trips/${randomUUID()}/activities/${randomUUID()}`],
  ['POST', `/trips/${randomUUID()}/invites`],
] as const

function encodeSegment(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function makeTokenSignedWith(
  secret: string,
  payload: object = { sub: randomUUID() },
) {
  const header = encodeSegment({ alg: 'HS256', typ: 'JWT' })
  const body = encodeSegment(payload)
  const signature = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url')

  return `${header}.${body}.${signature}`
}

function makeUnsignedToken() {
  const header = encodeSegment({ alg: 'none', typ: 'JWT' })
  const payload = encodeSegment({ sub: randomUUID() })

  return `${header}.${payload}.`
}

describe('Protected routes without authentication (E2E)', () => {
  beforeAll(async () => {
    await app.ready()

    await prisma.$connect()
  })

  afterAll(async () => {
    await app.close()
  })

  test.each(protectedRoutes)('[%s] %s returns 401', async (method, url) => {
    const response = await app.inject({ method, url })

    expect(response.statusCode).toBe(401)
  })

  test.each(protectedRoutes)(
    '[%s] %s returns 401 with a token signed by another secret',
    async (method, url) => {
      const response = await app.inject({
        method,
        url,
        headers: {
          authorization: `Bearer ${makeTokenSignedWith('another-secret')}`,
        },
      })

      expect(response.statusCode).toBe(401)
    },
  )

  test.each(protectedRoutes)(
    '[%s] %s returns 401 with an unsigned token',
    async (method, url) => {
      const response = await app.inject({
        method,
        url,
        headers: { authorization: `Bearer ${makeUnsignedToken()}` },
      })

      expect(response.statusCode).toBe(401)
    },
  )

  test('[GET] /me/trips returns 200 with a valid token', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const response = await app.inject({
      method: 'GET',
      url: '/me/trips',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
  })

  test.each(protectedRoutes)(
    '[%s] %s returns 401 with an expired token',
    async (method, url) => {
      const now = Math.floor(Date.now() / 1000)
      const expiredToken = makeTokenSignedWith(env.JWT_SECRET, {
        sub: randomUUID(),
        iat: now - 120,
        exp: now - 60,
      })

      const response = await app.inject({
        method,
        url,
        headers: { authorization: `Bearer ${expiredToken}` },
      })

      expect(response.statusCode).toBe(401)
    },
  )

  test('[GET] /me/trips returns 200 with a token signed by the app secret that has not expired', async () => {
    const { traveler } = await createAndAuthenticateTraveler(app)

    const now = Math.floor(Date.now() / 1000)
    const validToken = makeTokenSignedWith(env.JWT_SECRET, {
      sub: traveler.id,
      iat: now,
      exp: now + 60,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/me/trips',
      headers: { authorization: `Bearer ${validToken}` },
    })

    expect(response.statusCode).toBe(200)
  })
})

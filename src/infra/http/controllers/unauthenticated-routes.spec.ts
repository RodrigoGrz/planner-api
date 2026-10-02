import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createHmac, randomUUID } from 'node:crypto'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

const protectedRoutes = [
  ['GET', `/trips/${randomUUID()}`],
  ['POST', '/trips/register'],
  ['POST', '/trips/link/register'],
  ['POST', '/trips/activity/register'],
  ['GET', `/trips/${randomUUID()}/links`],
  ['GET', `/trips/${randomUUID()}/activities`],
  ['GET', `/trips/${randomUUID()}/participants`],
  ['GET', '/traveler/trips'],
  ['GET', '/traveler/next/trip'],
  ['PUT', `/trips/${randomUUID()}/update`],
  ['POST', `/trips/${randomUUID()}/image`],
  ['DELETE', `/trip/${randomUUID()}`],
  ['DELETE', `/trip/link/${randomUUID()}`],
  ['DELETE', `/trip/activity/${randomUUID()}`],
  ['POST', `/trips/${randomUUID()}/invites`],
] as const

function encodeSegment(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function makeTokenSignedWith(secret: string) {
  const header = encodeSegment({ alg: 'HS256', typ: 'JWT' })
  const payload = encodeSegment({ sub: randomUUID() })
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url')

  return `${header}.${payload}.${signature}`
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

  test('[GET] /traveler/trips returns 200 with a valid token', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const response = await app.inject({
      method: 'GET',
      url: '/traveler/trips',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
  })
})

import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { app } from '@/infra/app'
import { dayjs } from '@/lib/dayjs'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaTraveler } from 'tests/factories/make-traveler'

vi.hoisted(() => {
  process.env.RATE_LIMIT_ENABLED = 'true'
})

const TOO_MANY_REQUESTS_BODY = {
  message: 'Muitas requisições. Tente novamente mais tarde.',
}

describe('Rate limit (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /travelers/auth returns 429 after 10 attempts from the same IP', async () => {
    const email = faker.internet.email().toLowerCase()

    await makePrismaTraveler({ email, password: await hash('123456', 8) })

    const attempt = () =>
      app.inject({
        method: 'POST',
        url: '/travelers/auth',
        remoteAddress: '10.0.0.1',
        payload: { email, password: 'wrong-password' },
      })

    for (let i = 0; i < 10; i++) {
      expect((await attempt()).statusCode).toBe(401)
    }

    const blocked = await attempt()

    expect(blocked.statusCode).toBe(429)
    expect(blocked.json()).toEqual(TOO_MANY_REQUESTS_BODY)
    expect(blocked.headers['retry-after']).toBeDefined()
  })

  test('[POST] /travelers/auth counts attempts with different e-mails from the same IP', async () => {
    const attempt = () =>
      app.inject({
        method: 'POST',
        url: '/travelers/auth',
        remoteAddress: '10.0.0.2',
        payload: {
          email: faker.internet.email().toLowerCase(),
          password: 'wrong-password',
        },
      })

    for (let i = 0; i < 10; i++) {
      expect((await attempt()).statusCode).toBe(401)
    }

    expect((await attempt()).statusCode).toBe(429)
  })

  test('[POST] /travelers/register returns 429 after 5 registrations from the same IP', async () => {
    const register = () =>
      app.inject({
        method: 'POST',
        url: '/travelers/register',
        remoteAddress: '10.0.0.3',
        payload: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: '123456',
          phone: '11999999999',
        },
      })

    for (let i = 0; i < 5; i++) {
      expect((await register()).statusCode).toBe(201)
    }

    const blocked = await register()

    expect(blocked.statusCode).toBe(429)
    expect(blocked.json()).toEqual(TOO_MANY_REQUESTS_BODY)
  })

  test('[POST] /trips/register returns 429 after 20 requests per hour per traveler', async () => {
    const { token } = await createAndAuthenticateTraveler(app)
    const { token: otherToken } = await createAndAuthenticateTraveler(app)

    const createTrip = (authToken: string) =>
      app.inject({
        method: 'POST',
        url: '/trips/register',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          destination: 'Norway',
          startsAt: dayjs().add(1, 'month').toISOString(),
          endsAt: dayjs().add(1, 'month').add(4, 'day').toISOString(),
          emailsToInvite: [],
        },
      })

    for (let i = 0; i < 20; i++) {
      expect((await createTrip(token)).statusCode).toBe(201)
    }

    const blocked = await createTrip(token)

    expect(blocked.statusCode).toBe(429)
    expect(blocked.json()).toEqual(TOO_MANY_REQUESTS_BODY)
    expect((await createTrip(otherToken)).statusCode).toBe(201)
  })

  test('[POST] /trips/:tripId/invites returns 429 after 20 requests per hour per traveler', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const trip = await app.inject({
      method: 'POST',
      url: '/trips/register',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        destination: 'Norway',
        startsAt: dayjs().add(1, 'month').toISOString(),
        endsAt: dayjs().add(1, 'month').add(4, 'day').toISOString(),
        emailsToInvite: [],
      },
    })

    const invite = () =>
      app.inject({
        method: 'POST',
        url: `/trips/${trip.json().tripId}/invites`,
        headers: { authorization: `Bearer ${token}` },
        payload: { email: faker.internet.email() },
      })

    for (let i = 0; i < 20; i++) {
      expect((await invite()).statusCode).toBe(201)
    }

    const blocked = await invite()

    expect(blocked.statusCode).toBe(429)
    expect(blocked.json()).toEqual(TOO_MANY_REQUESTS_BODY)
  })

  test('[GET] /participants/confirm returns 429 after 20 requests from the same IP', async () => {
    const page = () =>
      app.inject({
        method: 'GET',
        url: `/participants/confirm?token=${randomUUID()}`,
        remoteAddress: '10.0.0.5',
      })

    for (let i = 0; i < 20; i++) {
      expect((await page()).statusCode).toBe(404)
    }

    expect((await page()).statusCode).toBe(429)
  })

  test('[POST] /participants/confirm returns 429 after 20 requests from the same IP', async () => {
    const confirm = () =>
      app.inject({
        method: 'POST',
        url: '/participants/confirm',
        remoteAddress: '10.0.0.7',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        payload: `token=${randomUUID()}`,
      })

    for (let i = 0; i < 20; i++) {
      expect((await confirm()).statusCode).toBe(404)
    }

    expect((await confirm()).statusCode).toBe(429)
  })

  test('[GET] /traveler/trips returns 429 after 100 requests per minute from the same IP', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const listTrips = () =>
      app.inject({
        method: 'GET',
        url: '/traveler/trips',
        remoteAddress: '10.0.0.6',
        headers: { authorization: `Bearer ${token}` },
      })

    for (let i = 0; i < 100; i++) {
      expect((await listTrips()).statusCode).toBe(200)
    }

    const blocked = await listTrips()

    expect(blocked.statusCode).toBe(429)
    expect(blocked.json()).toEqual(TOO_MANY_REQUESTS_BODY)
  })
})

import { app } from '@/infra/app'
import request from 'supertest'
import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'
import { makePrismaTraveler } from 'tests/factories/make-traveler'

describe('Authenticate (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /travelers/auth', async () => {
    const name = faker.person.firstName()
    const email = faker.internet.email()

    await makePrismaTraveler({
      name,
      email,
      password: await hash('123456', 8),
    })

    const travelerResponse = await request(app.server)
      .post('/travelers/auth')
      .send({
        email,
        password: '123456',
      })

    expect(travelerResponse.body).toHaveProperty('token')
  })

  test('[POST] /travelers/auth authenticates regardless of e-mail casing', async () => {
    const localPart = faker.string.alphanumeric(12).toLowerCase()

    await makePrismaTraveler({
      email: `${localPart}@planner.com`,
      password: await hash('123456', 8),
    })

    const response = await request(app.server)
      .post('/travelers/auth')
      .send({
        email: `  ${localPart.toUpperCase()}@Planner.COM `,
        password: '123456',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
  })

  test('[POST] /travelers/auth returns a token that expires in 7 days', async () => {
    const email = faker.internet.email()

    await makePrismaTraveler({
      email,
      password: await hash('123456', 8),
    })

    const response = await request(app.server).post('/travelers/auth').send({
      email,
      password: '123456',
    })

    const payload = app.jwt.decode<{ iat: number; exp?: number }>(
      response.body.token,
    )

    expect(payload?.exp).toBeDefined()
    expect((payload?.exp ?? 0) - (payload?.iat ?? 0)).toBe(7 * 24 * 60 * 60)
  })
})

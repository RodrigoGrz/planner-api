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
})

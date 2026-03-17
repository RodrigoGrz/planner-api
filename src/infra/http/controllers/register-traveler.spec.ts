import { app } from '@/infra/app'
import { faker } from '@faker-js/faker'
import request from 'supertest'

describe('Register Traveler (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /travelers/register', async () => {
    const travelerResponse = await request(app.server)
      .post('/travelers/register')
      .send({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: '1234567',
        phone: faker.phone.number(),
      })

    expect(travelerResponse.statusCode).toBe(201)
  })
})

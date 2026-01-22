import { app } from '@/infra/app'
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
        name: 'John Doe',
        email: 'johndoe@planner.com',
        password: '123456',
        phone: '5500999999999',
      })

    expect(travelerResponse.statusCode).toBe(201)
  })
})

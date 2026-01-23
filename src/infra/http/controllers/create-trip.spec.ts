import { app } from '@/infra/app'
import dayjs from 'dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

describe('Create Trip (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /trips/register', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Test',
        startsAt: dayjs().add(1, 'month'),
        endsAt: dayjs().add(1, 'month').add(4, 'day'),
        emailsToInvite: ['test@planner.com'],
      })

    expect(result.statusCode).toBe(201)
  })
})

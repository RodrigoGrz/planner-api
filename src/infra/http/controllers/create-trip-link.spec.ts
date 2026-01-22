import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Create Trip Link (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /trips/link/register', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .post('/trips/link/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Google',
        url: 'https://google.com',
        tripId: trip.id.toString(),
      })

    expect(result.statusCode).toBe(201)
  })
})

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Get Trip Details (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /trips/:id', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
    })

    const tripResponse = await request(app.server)
      .get(`/trips/${trip.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(tripResponse.statusCode).toBe(200)
    expect(tripResponse.body.trip.destination).toBe('Norway')
    expect(tripResponse.body.trip.ownerName).toStrictEqual(expect.any(String))
  })
})

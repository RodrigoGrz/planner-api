import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaLink } from 'tests/factories/make-link'
import { makePrismaTraveler } from 'tests/factories/make-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'
import { randomUUID } from 'node:crypto'

describe('Get Trip Links (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /trips/:tripId/links', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const owner2 = await makePrismaTraveler({
      name: 'test2',
      email: `test2-${randomUUID()}@planner.com`,
    })

    const trip1 = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
    })

    const trip2 = await makePrismaTrip({
      destination: 'London',
      ownerId: owner2.id,
    })

    await makePrismaLink({
      tripId: trip1.id,
    })

    await makePrismaLink({
      tripId: trip1.id,
    })

    await makePrismaLink({
      tripId: trip2.id,
    })

    const tripResponse = await request(app.server)
      .get(`/trips/${trip1.id.toString()}/links`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(tripResponse.statusCode).toBe(200)
    expect(tripResponse.body.links.length).toBe(2)
  })
})

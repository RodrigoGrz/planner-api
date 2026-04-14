import request from 'supertest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaLink } from 'tests/factories/make-link'
import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Delete Trip Links (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[DELETE] /trip/link/:linkId', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
    })

    const link = await makePrismaLink({
      tripId: trip.id,
    })

    await makePrismaLink({
      tripId: trip.id,
    })

    const linkResponse = await request(app.server)
      .delete(`/trip/link/${link.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const afterUpdated = await prisma.link.findMany({
      where: {
        trip_id: trip.id.toString(),
      },
    })

    expect(linkResponse.statusCode).toBe(204)
    expect(afterUpdated.length).toBe(1)
  })
})

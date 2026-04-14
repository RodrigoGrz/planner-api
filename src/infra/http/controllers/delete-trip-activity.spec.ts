import request from 'supertest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'
import { makePrismaActivity } from 'tests/factories/make-activity'

describe('Delete Trip Activity (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[DELETE] /trip/activity/:activityId', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
    })

    const activity = await makePrismaActivity({
      tripId: trip.id,
    })

    await makePrismaActivity({
      tripId: trip.id,
    })

    const activityResponse = await request(app.server)
      .delete(`/trip/activity/${activity.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const afterUpdated = await prisma.activity.findMany({
      where: {
        trip_id: trip.id.toString(),
      },
    })

    expect(activityResponse.statusCode).toBe(204)
    expect(afterUpdated.length).toBe(1)
  })
})

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

  test('[DELETE] /trips/:tripId/activities/:activityId', async () => {
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
      .delete(
        `/trips/${trip.id.toString()}/activities/${activity.id.toString()}`,
      )
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

  test('[DELETE] /trips/:tripId/activities/:activityId returns 404 when the activity does not exist', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const activityResponse = await request(app.server)
      .delete(
        `/trips/${new UniqueEntityID().toString()}/activities/${new UniqueEntityID().toString()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(activityResponse.statusCode).toBe(404)
  })

  test('[DELETE] /trips/:tripId/activities/:activityId returns 404 when the activity belongs to another trip', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })
    const anotherTrip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const activity = await makePrismaActivity({
      tripId: anotherTrip.id,
    })

    const response = await request(app.server)
      .delete(
        `/trips/${trip.id.toString()}/activities/${activity.id.toString()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const activityAfter = await prisma.activity.findUnique({
      where: { id: activity.id.toString() },
    })

    expect(response.statusCode).toBe(404)
    expect(response.body.message).toBe('Recurso não encontrado.')
    expect(activityAfter).not.toBeNull()
  })
})

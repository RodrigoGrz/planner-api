import request from 'supertest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'
import { makePrismaLink } from 'tests/factories/make-link'
import { makePrismaActivity } from 'tests/factories/make-activity'
import { makePrismaParticipant } from 'tests/factories/make-participant'

describe('Delete Trip (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[DELETE] /trip/:tripId', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
    })

    await makePrismaLink({
      tripId: trip.id,
    })

    await makePrismaActivity({
      tripId: trip.id,
    })

    await makePrismaParticipant({
      tripId: trip.id,
      travelerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .delete(`/trip/${trip.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const tripAfterDelete = await prisma.trip.findUnique({
      where: {
        id: trip.id.toString(),
      },
    })

    const linksAfterDelete = await prisma.link.findMany({
      where: {
        trip_id: trip.id.toString(),
      },
    })

    const activitiesAfterDelete = await prisma.activity.findMany({
      where: {
        trip_id: trip.id.toString(),
      },
    })

    const participantsAfterDelete = await prisma.participant.findMany({
      where: {
        trip_id: trip.id.toString(),
      },
    })

    expect(response.statusCode).toBe(204)
    expect(tripAfterDelete).toBeNull()
    expect(linksAfterDelete.length).toBe(0)
    expect(activitiesAfterDelete.length).toBe(0)
    expect(participantsAfterDelete.length).toBe(0)
  })
})

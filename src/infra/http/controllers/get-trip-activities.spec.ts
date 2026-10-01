import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { dayjs } from '@/lib/dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaActivity } from 'tests/factories/make-activity'
import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Get Trip Activities (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /trips/:tripId/activities', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip1 = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
    })

    const trip2 = await makePrismaTrip({
      destination: 'London',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: dayjs().add(4, 'month').toDate(),
      endsAt: dayjs().add(4, 'month').add(4, 'day').toDate(),
    })

    await makePrismaActivity({
      tripId: trip1.id,
      occursAt: dayjs().add(1, 'month').toDate(),
    })

    await makePrismaActivity({
      tripId: trip1.id,
      occursAt: dayjs().add(1, 'month').toDate(),
    })

    await makePrismaActivity({
      tripId: trip1.id,
      occursAt: dayjs().add(1, 'month').add(1, 'day').toDate(),
    })

    await makePrismaActivity({
      tripId: trip2.id,
      occursAt: dayjs().add(4, 'month').toDate(),
    })

    const tripResponse = await request(app.server)
      .get(`/trips/${trip1.id.toString()}/activities`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(tripResponse.statusCode).toBe(200)
    expect(tripResponse.body.activities.length).toBe(4)
    expect(tripResponse.body.activities[0].activities.length).toBe(2)
    expect(tripResponse.body.activities[1].activities.length).toBe(1)
    expect(tripResponse.body.activities[2].activities.length).toBe(0)
  })

  async function createTripWithOneActivity() {
    const { token, traveler } = await createAndAuthenticateTraveler(app)
    const startsAt = dayjs().add(1, 'month')

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: startsAt.toDate(),
      endsAt: startsAt.add(2, 'day').toDate(),
    })

    const activity = await makePrismaActivity({
      tripId: trip.id,
      occursAt: startsAt.toDate(),
    })

    return { token, trip, activity }
  }

  test('[GET] /trips/:tripId/activities returns the persisted activity ids', async () => {
    const { token, trip, activity } = await createTripWithOneActivity()

    const response = await request(app.server)
      .get(`/trips/${trip.id.toString()}/activities`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.activities[0].activities[0].id).toBe(
      activity.id.toString(),
    )
  })

  test('[GET] /trips/:tripId/activities returns ids that can be deleted', async () => {
    const { token, trip } = await createTripWithOneActivity()

    const listResponse = await request(app.server)
      .get(`/trips/${trip.id.toString()}/activities`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const activityId = listResponse.body.activities[0].activities[0].id

    const deleteResponse = await request(app.server)
      .delete(`/trip/activity/${activityId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(deleteResponse.statusCode).toBe(204)
    expect(
      await prisma.activity.findUnique({ where: { id: activityId } }),
    ).toBeNull()
  })
})

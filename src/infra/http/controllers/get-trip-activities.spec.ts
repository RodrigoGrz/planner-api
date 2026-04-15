import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
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
})

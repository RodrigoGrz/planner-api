import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { dayjs } from '@/lib/dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Create Trip Activity (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /trips/activity/register', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
    })

    const result = await request(app.server)
      .post('/trips/activity/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Hotel Check-in',
        occursAt: dayjs().add(1, 'month').add(1, 'hour').toDate(),
        tripId: trip.id.toString(),
      })

    expect(result.statusCode).toBe(201)
  })
})

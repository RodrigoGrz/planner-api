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
    expect(result.body).toEqual(
      expect.objectContaining({
        activityId: expect.any(String),
      }),
    )
  })

  test('[POST] /trips/activity/register accepts an activity in the afternoon of the last day', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const firstDay = dayjs.utc().add(1, 'month').startOf('day')
    const lastDay = firstDay.add(3, 'day')

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: firstDay.toDate(),
      endsAt: lastDay.toDate(),
    })

    const result = await request(app.server)
      .post('/trips/activity/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Farewell dinner',
        occursAt: lastDay.hour(14).toDate(),
        tripId: trip.id.toString(),
      })

    expect(result.statusCode).toBe(201)
  })

  test('[POST] /trips/activity/register returns 409 when the trip does not exist', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .post('/trips/activity/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Hotel Check-in',
        occursAt: dayjs().add(1, 'month').add(1, 'hour').toDate(),
        tripId: new UniqueEntityID().toString(),
      })

    expect(result.statusCode).toBe(409)
  })
})

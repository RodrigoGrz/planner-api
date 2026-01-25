import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import dayjs from 'dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'
import { describe, beforeAll, afterAll, test, expect } from 'vitest'

describe('Upload Trip Cover Image (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test.skip('[POST] /trips/:tripId/image', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
    })

    const imageResponse = await request(app.server)
      .post(`/trips/${trip.id.toString()}/image`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', './tests/e2e/upload/sample.jpg')

    expect(imageResponse.statusCode).toEqual(204)
  })
})

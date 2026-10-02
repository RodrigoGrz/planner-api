import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { dayjs } from '@/lib/dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Update Trip (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[PUT] /trips/:tripId/update', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'London',
        startsAt: dayjs().add(2, 'month').toDate(),
        endsAt: dayjs().add(2, 'month').add(3, 'day').toDate(),
      })

    const afterUpdated = await prisma.trip.findUnique({
      where: {
        id: trip.id.toString(),
      },
    })

    expect(result.statusCode).toBe(204)
    expect(afterUpdated?.destination).toBe('London')
  })

  test('[PUT] /trips/:tripId/update returns 409 for a trip longer than 30 days', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'London',
        startsAt: dayjs().add(2, 'month').toDate(),
        endsAt: new Date('9999-12-31T00:00:00.000Z'),
      })

    const afterUpdate = await prisma.trip.findUnique({
      where: {
        id: trip.id.toString(),
      },
    })

    expect(result.statusCode).toBe(409)
    expect(afterUpdate?.ends_at).toEqual(trip.endsAt)
  })

  test('[PUT] /trips/:tripId/update keeps created_at', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)
    const createdAt = dayjs().subtract(1, 'year').startOf('second').toDate()

    const trip = await makePrismaTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
      createdAt,
    })

    const result = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'London',
        startsAt: dayjs().add(2, 'month').toDate(),
        endsAt: dayjs().add(2, 'month').add(3, 'day').toDate(),
      })

    const afterUpdated = await prisma.trip.findUnique({
      where: {
        id: trip.id.toString(),
      },
    })

    expect(result.statusCode).toBe(204)
    expect(afterUpdated?.created_at).toEqual(createdAt)
  })

  test('[PUT] /trips/:tripId/update returns 409 when the trip does not exist', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .put(`/trips/${new UniqueEntityID().toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'London',
        startsAt: dayjs().add(2, 'month').toDate(),
        endsAt: dayjs().add(2, 'month').add(3, 'day').toDate(),
      })

    expect(result.statusCode).toBe(409)
  })
})

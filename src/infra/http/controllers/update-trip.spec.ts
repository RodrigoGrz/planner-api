import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { dayjs } from '@/lib/dayjs'
import type { Dayjs } from 'dayjs'
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

  test('[PUT] /trips/:tripId/update renames an ongoing trip without changing dates', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      startsAt: dayjs().subtract(1, 'day').toDate(),
      endsAt: dayjs().add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'London',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    const afterUpdate = await prisma.trip.findUnique({
      where: {
        id: trip.id.toString(),
      },
    })

    expect(result.statusCode).toBe(204)
    expect(afterUpdate?.destination).toBe('London')
  })

  test.each([
    ['an empty destination', ''],
    ['a blank destination', '   '],
    ['a destination shorter than 3 characters', 'ab'],
  ])(
    '[PUT] /trips/:tripId/update returns 400 for %s',
    async (_, destination) => {
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
          destination,
          startsAt: trip.startsAt,
          endsAt: trip.endsAt,
        })

      const afterUpdate = await prisma.trip.findUnique({
        where: {
          id: trip.id.toString(),
        },
      })

      expect(result.statusCode).toBe(400)
      expect(afterUpdate?.destination).toBe('Norway')
    },
  )

  test.each([
    ['a number', (day: Dayjs) => day.valueOf()],
    ['a date without time', (day: Dayjs) => day.format('YYYY-MM-DD')],
    [
      'a date time without offset',
      (day: Dayjs) => day.format('YYYY-MM-DDTHH:mm:ss'),
    ],
  ])(
    '[PUT] /trips/:tripId/update returns 400 when endsAt is %s',
    async (_, buildEndsAt) => {
      const { token, traveler } = await createAndAuthenticateTraveler(app)

      const firstDay = dayjs.utc().add(1, 'month').startOf('day')

      const trip = await makePrismaTrip({
        startsAt: firstDay.toDate(),
        endsAt: firstDay.add(3, 'day').toDate(),
        ownerId: new UniqueEntityID(traveler.id),
      })

      const result = await request(app.server)
        .put(`/trips/${trip.id.toString()}/update`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: trip.destination,
          startsAt: trip.startsAt.toISOString(),
          endsAt: buildEndsAt(firstDay.add(5, 'day').hour(10)),
        })

      const afterUpdate = await prisma.trip.findUnique({
        where: { id: trip.id.toString() },
      })

      expect(result.statusCode).toBe(400)
      expect(afterUpdate?.ends_at).toEqual(trip.endsAt)
    },
  )

  test('[PUT] /trips/:tripId/update returns 400 when endsAt is before startsAt', async () => {
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
        endsAt: dayjs().add(2, 'month').subtract(1, 'day').toDate(),
      })

    expect(result.statusCode).toBe(400)
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

  test('[PUT] /trips/:tripId/update with the current version in If-Match', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .set('If-Match', '"1"')
      .send({
        destination: 'London',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    const detailsResponse = await request(app.server)
      .get(`/trips/${trip.id.toString()}`)
      .set('Authorization', `Bearer ${token}`)

    expect(result.statusCode).toBe(204)
    expect(detailsResponse.body.trip.version).toBe(2)
  })

  test('[PUT] /trips/:tripId/update returns 412 with a stale If-Match', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const firstEdit = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .set('If-Match', '"1"')
      .send({
        destination: 'London',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    const staleEdit = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .set('If-Match', '"1"')
      .send({
        destination: 'Rome',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    const stored = await prisma.trip.findUnique({
      where: { id: trip.id.toString() },
    })

    expect(firstEdit.statusCode).toBe(204)
    expect(staleEdit.statusCode).toBe(412)
    expect(stored?.destination).toBe('London')
  })

  test('[PUT] /trips/:tripId/update returns 400 with a malformed If-Match', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .set('If-Match', 'not-a-version')
      .send({
        destination: 'London',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    expect(result.statusCode).toBe(400)
  })

  test('[PUT] /trips/:tripId/update returns 400 with an If-Match out of range', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .set('If-Match', '"99999999999"')
      .send({
        destination: 'London',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    expect(result.statusCode).toBe(400)
  })

  test('[PUT] /trips/:tripId/update accepts If-Match * as no precondition', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const result = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .set('If-Match', '*')
      .send({
        destination: 'London',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    expect(result.statusCode).toBe(204)
  })

  test('[PUT] /trips/:tripId/update without If-Match keeps working', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: new UniqueEntityID(traveler.id),
    })

    const firstEdit = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'London',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    const secondEdit = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Rome',
        startsAt: trip.startsAt,
        endsAt: trip.endsAt,
      })

    expect(firstEdit.statusCode).toBe(204)
    expect(secondEdit.statusCode).toBe(204)
  })
})

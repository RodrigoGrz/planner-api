import request from 'supertest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'
import { makePrismaLink } from 'tests/factories/make-link'
import { makePrismaActivity } from 'tests/factories/make-activity'
import { dayjs } from '@/lib/dayjs'

describe('Trip authorization (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[PUT] /trips/:tripId/update returns 403 for a traveler who is not the owner', async () => {
    const { traveler: owner } = await createAndAuthenticateTraveler(app)
    const { token: intruderToken } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(owner.id),
    })

    const response = await request(app.server)
      .put(`/trips/${trip.id.toString()}/update`)
      .set('Authorization', `Bearer ${intruderToken}`)
      .send({
        destination: 'London',
        startsAt: dayjs().add(2, 'month').toDate(),
        endsAt: dayjs().add(2, 'month').add(4, 'day').toDate(),
      })

    const tripAfter = await prisma.trip.findUniqueOrThrow({
      where: { id: trip.id.toString() },
    })

    expect(response.statusCode).toBe(403)
    expect(tripAfter.destination).toBe('Norway')
  })

  test('[DELETE] /trip/link/:linkId returns 403 for a traveler who is not the owner', async () => {
    const { traveler: owner } = await createAndAuthenticateTraveler(app)
    const { token: intruderToken } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(owner.id),
    })

    const link = await makePrismaLink({
      tripId: trip.id,
    })

    const response = await request(app.server)
      .delete(`/trip/link/${link.id.toString()}`)
      .set('Authorization', `Bearer ${intruderToken}`)
      .send()

    const linkAfter = await prisma.link.findUnique({
      where: { id: link.id.toString() },
    })

    expect(response.statusCode).toBe(403)
    expect(linkAfter).not.toBeNull()
  })

  test('[DELETE] /trip/activity/:activityId returns 403 for a traveler who is not the owner', async () => {
    const { traveler: owner } = await createAndAuthenticateTraveler(app)
    const { token: intruderToken } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(owner.id),
    })

    const activity = await makePrismaActivity({
      tripId: trip.id,
    })

    const response = await request(app.server)
      .delete(`/trip/activity/${activity.id.toString()}`)
      .set('Authorization', `Bearer ${intruderToken}`)
      .send()

    const activityAfter = await prisma.activity.findUnique({
      where: { id: activity.id.toString() },
    })

    expect(response.statusCode).toBe(403)
    expect(activityAfter).not.toBeNull()
  })

  test('[GET] /trips/:id returns 403 for a traveler who is neither owner nor participant', async () => {
    const { traveler: owner } = await createAndAuthenticateTraveler(app)
    const { token: intruderToken } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(owner.id),
    })

    const response = await request(app.server)
      .get(`/trips/${trip.id.toString()}`)
      .set('Authorization', `Bearer ${intruderToken}`)
      .send()

    expect(response.statusCode).toBe(403)
  })

  test('[POST] /trips/:tripId/invites returns 403 for a traveler who is not the owner', async () => {
    const { traveler: owner } = await createAndAuthenticateTraveler(app)
    const { token: intruderToken } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(owner.id),
    })

    const response = await request(app.server)
      .post(`/trips/${trip.id.toString()}/invites`)
      .set('Authorization', `Bearer ${intruderToken}`)
      .send({ email: 'invited@planner.com' })

    const participants = await prisma.participant.findMany({
      where: { trip_id: trip.id.toString() },
    })

    expect(response.statusCode).toBe(403)
    expect(participants).toHaveLength(0)
  })
})

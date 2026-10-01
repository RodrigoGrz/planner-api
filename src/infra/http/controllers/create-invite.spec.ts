import request from 'supertest'
import { randomUUID } from 'node:crypto'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Create Invite (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /trips/:tripId/invites', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .post(`/trips/${trip.id.toString()}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invited@planner.com' })

    const participant = await prisma.participant.findFirst({
      where: {
        trip_id: trip.id.toString(),
        email: 'invited@planner.com',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(participant).toMatchObject({
      is_confirmed: false,
      confirmation_token: expect.any(String),
    })
  })

  test('[POST] /trips/:tripId/invites returns 409 for a non-existing trip', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const response = await request(app.server)
      .post(`/trips/${randomUUID()}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invited@planner.com' })

    expect(response.statusCode).toBe(409)
  })

  test('[POST] /trips/:tripId/invites returns 409 for an e-mail already invited', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    await request(app.server)
      .post(`/trips/${trip.id.toString()}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invited@planner.com' })

    const response = await request(app.server)
      .post(`/trips/${trip.id.toString()}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invited@planner.com' })

    const participants = await prisma.participant.findMany({
      where: { trip_id: trip.id.toString() },
    })

    expect(response.statusCode).toBe(409)
    expect(participants).toHaveLength(1)
  })

  test('[POST] /trips/:tripId/invites returns 400 for an invalid e-mail', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .post(`/trips/${trip.id.toString()}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'not-an-email' })

    const participants = await prisma.participant.findMany({
      where: { trip_id: trip.id.toString() },
    })

    expect(response.statusCode).toBe(400)
    expect(participants).toHaveLength(0)
  })
})

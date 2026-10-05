import request from 'supertest'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaParticipant } from 'tests/factories/make-participant'
import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Remove Trip Participant (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[DELETE] /trips/:tripId/participants/:participantId', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const participant = await makePrismaParticipant({
      tripId: trip.id,
      travelerId: null,
    })

    const response = await request(app.server)
      .delete(
        `/trips/${trip.id.toString()}/participants/${participant.id.toString()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toBe(204)
    expect(
      await prisma.participant.findUnique({
        where: { id: participant.id.toString() },
      }),
    ).toBeNull()
  })

  test('[DELETE] /trips/:tripId/participants/:participantId returns 403 for a traveler who is not the owner', async () => {
    const { traveler: owner } = await createAndAuthenticateTraveler(app)
    const { token: intruderToken } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(owner.id),
    })

    const participant = await makePrismaParticipant({
      tripId: trip.id,
      travelerId: null,
    })

    const response = await request(app.server)
      .delete(
        `/trips/${trip.id.toString()}/participants/${participant.id.toString()}`,
      )
      .set('Authorization', `Bearer ${intruderToken}`)
      .send()

    expect(response.statusCode).toBe(403)
    expect(
      await prisma.participant.findUnique({
        where: { id: participant.id.toString() },
      }),
    ).not.toBeNull()
  })

  test('[DELETE] /trips/:tripId/participants/:participantId returns 404 for a participant of another trip', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })
    const anotherTrip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const participant = await makePrismaParticipant({
      tripId: anotherTrip.id,
      travelerId: null,
    })

    const response = await request(app.server)
      .delete(
        `/trips/${trip.id.toString()}/participants/${participant.id.toString()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toBe(404)
    expect(
      await prisma.participant.findUnique({
        where: { id: participant.id.toString() },
      }),
    ).not.toBeNull()
  })

  test('[DELETE] /trips/:tripId/participants/:participantId returns 422 when the owner removes themselves', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      ownerId: new UniqueEntityID(traveler.id),
    })

    const ownerParticipant = await makePrismaParticipant({
      tripId: trip.id,
      travelerId: new UniqueEntityID(traveler.id),
      isConfirmed: true,
    })

    const response = await request(app.server)
      .delete(
        `/trips/${trip.id.toString()}/participants/${ownerParticipant.id.toString()}`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toBe(422)
    expect(response.body.message).toBe(
      'O dono não pode sair da própria viagem.',
    )
  })
})

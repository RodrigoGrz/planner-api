import { randomUUID } from 'node:crypto'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { dayjs } from '@/lib/dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaParticipant } from 'tests/factories/make-participant'
import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Confirm Participant (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /participants/confirm', async () => {
    const { traveler } = await createAndAuthenticateTraveler(app)

    const trip = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
    })

    const confirmationToken = randomUUID()

    const participant = await makePrismaParticipant({
      tripId: trip.id,
      travelerId: null,
      isConfirmed: false,
      confirmationToken,
    })

    const response = await request(app.server)
      .get('/participants/confirm')
      .query({ token: confirmationToken })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.text).toContain('Norway')

    const confirmed = await prisma.participant.findUniqueOrThrow({
      where: { id: participant.id.toString() },
    })

    expect(confirmed.is_confirmed).toBe(true)
    expect(confirmed.confirmation_token).toBeNull()
  })

  test('[GET] /participants/confirm with an invalid token', async () => {
    const response = await request(app.server)
      .get('/participants/confirm')
      .query({ token: randomUUID() })
      .send()

    expect(response.statusCode).toBe(404)
    expect(response.headers['content-type']).toContain('text/html')
  })
})

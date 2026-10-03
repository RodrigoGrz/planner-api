import { randomUUID } from 'node:crypto'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { dayjs } from '@/lib/dayjs'
import { ParticipantProps } from '@/domain/trip/enterprise/entities/participant'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaParticipant } from 'tests/factories/make-participant'
import { makePrismaTrip } from 'tests/factories/make-trip'
import { makePrismaTraveler } from 'tests/factories/make-traveler'

async function makeInvite(
  tripPeriod: { startsAt: Date; endsAt: Date },
  participantOverride: Partial<ParticipantProps> = {},
) {
  const { traveler: owner } = await createAndAuthenticateTraveler(app)

  const trip = await makePrismaTrip({
    destination: 'Norway',
    ownerId: new UniqueEntityID(owner.id),
    ...tripPeriod,
  })

  const confirmationToken = randomUUID()

  const participant = await makePrismaParticipant({
    tripId: trip.id,
    travelerId: null,
    isConfirmed: false,
    confirmationToken,
    ...participantOverride,
  })

  return { participant, confirmationToken }
}

const upcomingTrip = () => ({
  startsAt: dayjs.utc().add(1, 'month').startOf('day').toDate(),
  endsAt: dayjs.utc().add(1, 'month').add(3, 'day').startOf('day').toDate(),
})

const finishedTrip = () => ({
  startsAt: dayjs.utc().subtract(10, 'day').startOf('day').toDate(),
  endsAt: dayjs.utc().subtract(1, 'day').startOf('day').toDate(),
})

function findParticipant(id: string) {
  return prisma.participant.findUniqueOrThrow({ where: { id } })
}

describe('Confirm Participant (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /participants/confirm shows the confirmation page without confirming', async () => {
    const { participant, confirmationToken } = await makeInvite(upcomingTrip())

    const response = await request(app.server)
      .get('/participants/confirm')
      .query({ token: confirmationToken })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.text).toContain('Norway')
    expect(response.text).toContain(
      '<form method="post" action="/participants/confirm"',
    )
    expect(response.text).toContain(`value="${confirmationToken}"`)

    const stored = await findParticipant(participant.id.toString())

    expect(stored.is_confirmed).toBe(false)
    expect(stored.confirmation_token).toBe(confirmationToken)
  })

  test('[POST] /participants/confirm confirms the participant', async () => {
    const { participant, confirmationToken } = await makeInvite(upcomingTrip())

    const response = await request(app.server)
      .post('/participants/confirm')
      .type('form')
      .send({ token: confirmationToken })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toContain('text/html')
    expect(response.text).toContain('Norway')

    const confirmed = await findParticipant(participant.id.toString())

    expect(confirmed.is_confirmed).toBe(true)
    expect(confirmed.confirmation_token).toBeNull()
  })

  test('[POST] /participants/confirm links the participant to the traveler with the same e-mail', async () => {
    const invitedTraveler = await makePrismaTraveler()

    const { participant, confirmationToken } = await makeInvite(
      upcomingTrip(),
      { email: invitedTraveler.email, name: null },
    )

    const response = await request(app.server)
      .post('/participants/confirm')
      .type('form')
      .send({ token: confirmationToken })

    expect(response.statusCode).toBe(200)

    const confirmed = await findParticipant(participant.id.toString())

    expect(confirmed.is_confirmed).toBe(true)
    expect(confirmed.traveler_id).toBe(invitedTraveler.id.toString())
    expect(confirmed.name).toBe(invitedTraveler.name)
  })

  test('[GET] /participants/confirm with an invalid token', async () => {
    const response = await request(app.server)
      .get('/participants/confirm')
      .query({ token: randomUUID() })
      .send()

    expect(response.statusCode).toBe(404)
    expect(response.headers['content-type']).toContain('text/html')
  })

  test('[POST] /participants/confirm with an invalid token', async () => {
    const response = await request(app.server)
      .post('/participants/confirm')
      .type('form')
      .send({ token: randomUUID() })

    expect(response.statusCode).toBe(404)
    expect(response.headers['content-type']).toContain('text/html')
  })

  test('[GET] /participants/confirm returns 400 for a token longer than 100 characters', async () => {
    const response = await request(app.server)
      .get('/participants/confirm')
      .query({ token: 'a'.repeat(101) })
      .send()

    expect(response.statusCode).toBe(400)
  })

  test('[POST] /participants/confirm returns 400 for a token longer than 100 characters', async () => {
    const response = await request(app.server)
      .post('/participants/confirm')
      .type('form')
      .send({ token: 'a'.repeat(101) })

    expect(response.statusCode).toBe(400)
  })

  test('[POST] /participants/confirm without a token', async () => {
    const response = await request(app.server)
      .post('/participants/confirm')
      .type('form')
      .send({})

    expect(response.statusCode).toBe(404)
    expect(response.headers['content-type']).toContain('text/html')
  })

  test.each([
    ['GET', () => request(app.server).get('/participants/confirm')],
    ['POST', () => request(app.server).post('/participants/confirm')],
  ])(
    '[%s] /participants/confirm returns the expired page for a finished trip',
    async (method, buildRequest) => {
      const { participant, confirmationToken } =
        await makeInvite(finishedTrip())

      const pending = buildRequest()
      const response =
        method === 'GET'
          ? await pending.query({ token: confirmationToken }).send()
          : await pending.type('form').send({ token: confirmationToken })

      expect(response.statusCode).toBe(410)
      expect(response.headers['content-type']).toContain('text/html')
      expect(response.text).toContain('Este convite expirou')

      const stored = await findParticipant(participant.id.toString())

      expect(stored.is_confirmed).toBe(false)
    },
  )
})

import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { dayjs } from '@/lib/dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

describe('Create Trip (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /trips/register', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Test',
        startsAt: dayjs().add(1, 'month'),
        endsAt: dayjs().add(1, 'month').add(4, 'day'),
        emailsToInvite: ['test@planner.com'],
      })

    expect(result.statusCode).toBe(201)
  })

  test('[POST] /trips/register should not allow invalid e-mails', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Test',
        startsAt: dayjs().add(1, 'month'),
        endsAt: dayjs().add(1, 'month').add(4, 'day'),
        emailsToInvite: ['invalid-email'],
      })

    expect(result.statusCode).toBe(400)
  })

  test.each([
    ['a leading space', ' application/json'],
    ['a leading tab', '\tapplication/json'],
  ])(
    '[POST] /trips/register should validate body when content-type has %s',
    async (_, contentType) => {
      const { token, traveler } = await createAndAuthenticateTraveler(app)

      const result = await app.inject({
        method: 'POST',
        url: '/trips/register',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': contentType,
        },
        payload: JSON.stringify({
          destination: 'Test',
          startsAt: dayjs().add(1, 'month'),
          endsAt: dayjs().add(1, 'month').add(4, 'day'),
          emailsToInvite: ['invalid-email'],
        }),
      })

      expect(result.statusCode).toBe(400)
      expect(
        await prisma.trip.count({ where: { owner_id: traveler.id } }),
      ).toBe(0)
    },
  )

  test('[POST] /trips/register returns 400 for a blank destination', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: '   ',
        startsAt: dayjs().add(1, 'month'),
        endsAt: dayjs().add(1, 'month').add(4, 'day'),
        emailsToInvite: [],
      })

    expect(result.statusCode).toBe(400)
    expect(await prisma.trip.count({ where: { owner_id: traveler.id } })).toBe(
      0,
    )
  })

  test('[POST] /trips/register returns 409 for a trip longer than 30 days', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Test',
        startsAt: dayjs().add(1, 'month'),
        endsAt: new Date('9999-12-31T00:00:00.000Z'),
        emailsToInvite: [],
      })

    expect(result.statusCode).toBe(409)
    expect(await prisma.trip.count({ where: { owner_id: traveler.id } })).toBe(
      0,
    )
  })

  test('[POST] /trips/register should not allow more than 20 invites', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const emails = Array.from({ length: 21 }, (_, i) => `test${i}@planner.com`)

    const result = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Test',
        startsAt: dayjs().add(1, 'month'),
        endsAt: dayjs().add(1, 'month').add(4, 'day'),
        emailsToInvite: emails,
      })

    expect(result.statusCode).toBe(400)
  })

  test('[POST] /trips/register should not create duplicate participants per trip', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const emails = ['test@planner.com', 'test@planner.com', 'test@planner.com']

    const result = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Test',
        startsAt: dayjs().add(1, 'month'),
        endsAt: dayjs().add(1, 'month').add(4, 'day'),
        emailsToInvite: emails,
      })

    expect(result.statusCode).toBe(201)

    const { tripId } = result.body

    expect(tripId).toStrictEqual(expect.any(String))

    const participants = await prisma.participant.findMany({
      where: {
        trip_id: tripId,
      },
    })

    expect(participants.length).toBe(2)

    const emailsInDb = participants.map((p) => p.email)

    expect(new Set(emailsInDb).size).toBe(emailsInDb.length)
  })
})

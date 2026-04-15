import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import dayjs from 'dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

describe('Create Trip (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(async () => {
    await prisma.participant.deleteMany()
    await prisma.trip.deleteMany()
    await prisma.traveler.deleteMany()
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

  test('[POST] /trips/register should ignore duplicated e-mails', async () => {
    const { token } = await createAndAuthenticateTraveler(app)

    const result = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Test',
        startsAt: dayjs().add(1, 'month'),
        endsAt: dayjs().add(1, 'month').add(4, 'day'),
        emailsToInvite: ['test@planner.com', 'test@planner.com'],
      })

    expect(result.statusCode).toBe(201)
  })
})

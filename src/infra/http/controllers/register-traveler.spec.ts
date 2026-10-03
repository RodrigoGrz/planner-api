import { app } from '@/infra/app'
import { prisma } from '@/infra/database/prisma/prisma'
import { faker } from '@faker-js/faker'
import request from 'supertest'
import { getRounds } from 'bcryptjs'
import { dayjs } from '@/lib/dayjs'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'

describe('Register Traveler (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /travelers/register', async () => {
    const travelerResponse = await request(app.server)
      .post('/travelers/register')
      .send({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: '1234567',
        phone: faker.phone.number({
          style: 'international',
        }),
      })

    expect(travelerResponse.statusCode).toBe(201)
  })

  test('[POST] /travelers/register stores the e-mail in lowercase', async () => {
    const localPart = faker.string.alphanumeric(12).toLowerCase()

    const response = await request(app.server)
      .post('/travelers/register')
      .send({
        name: faker.person.fullName(),
        email: `  ${localPart.toUpperCase()}@Planner.COM `,
        password: '1234567',
        phone: faker.phone.number({ style: 'international' }),
      })

    const traveler = await prisma.traveler.findUnique({
      where: { email: `${localPart}@planner.com` },
    })

    expect(response.statusCode).toBe(201)
    expect(traveler).not.toBeNull()
  })

  test('[POST] /travelers/register stores the password with bcrypt cost 10', async () => {
    const email = faker.string.alphanumeric(12).toLowerCase() + '@planner.com'

    const response = await request(app.server)
      .post('/travelers/register')
      .send({
        name: faker.person.fullName(),
        email,
        password: '1234567',
        phone: faker.phone.number({ style: 'international' }),
      })

    const traveler = await prisma.traveler.findUniqueOrThrow({
      where: { email },
    })

    expect(response.statusCode).toBe(201)
    expect(getRounds(traveler.password)).toBe(10)
  })

  test('[POST] /travelers/register returns 409 for an e-mail already registered with different casing', async () => {
    const localPart = faker.string.alphanumeric(12).toLowerCase()

    const registerWith = (email: string) =>
      request(app.server)
        .post('/travelers/register')
        .send({
          name: faker.person.fullName(),
          email,
          password: '1234567',
          phone: faker.phone.number({ style: 'international' }),
        })

    const first = await registerWith(`${localPart}@planner.com`)
    const second = await registerWith(
      `  ${localPart.toUpperCase()}@Planner.com `,
    )

    expect(first.statusCode).toBe(201)
    expect(second.statusCode).toBe(409)
  })

  test('[POST] /travelers/register links pending invites', async () => {
    const { token: ownerToken } = await createAndAuthenticateTraveler(app)
    const invitedEmail = faker.internet.email()

    const tripResponse = await request(app.server)
      .post('/trips/register')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        destination: 'Norway',
        startsAt: dayjs().add(1, 'month'),
        endsAt: dayjs().add(1, 'month').add(4, 'day'),
        emailsToInvite: [invitedEmail],
      })

    expect(tripResponse.statusCode).toBe(201)

    const registerResponse = await request(app.server)
      .post('/travelers/register')
      .send({
        name: faker.person.fullName(),
        email: invitedEmail,
        password: '1234567',
        phone: faker.phone.number({
          style: 'international',
        }),
      })

    expect(registerResponse.statusCode).toBe(201)

    const authResponse = await request(app.server)
      .post('/travelers/auth')
      .send({ email: invitedEmail, password: '1234567' })

    const tripsResponse = await request(app.server)
      .get('/traveler/trips')
      .set('Authorization', `Bearer ${authResponse.body.token}`)
      .send()

    expect(tripsResponse.statusCode).toBe(200)
    expect(
      tripsResponse.body.trips.map((trip: { tripId: string }) => trip.tripId),
    ).toEqual([tripResponse.body.tripId])
  })
})

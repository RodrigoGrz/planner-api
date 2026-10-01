import { app } from '@/infra/app'
import { faker } from '@faker-js/faker'
import request from 'supertest'
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

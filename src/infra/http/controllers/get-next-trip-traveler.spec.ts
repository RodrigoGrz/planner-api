import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import dayjs from 'dayjs'
import request from 'supertest'
import { createAndAuthenticateTraveler } from 'tests/e2e/utils/create-and-authenticate-traveler'
import { makePrismaParticipant } from 'tests/factories/make-participant'
import { makePrismaTrip } from 'tests/factories/make-trip'

describe('Get Next Trip Traveler (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /traveler/next/trip', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)

    const trip1 = await makePrismaTrip({
      destination: 'Norway',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
    })

    const trip2 = await makePrismaTrip({
      destination: 'London',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: dayjs().add(4, 'month').toDate(),
      endsAt: dayjs().add(4, 'month').add(4, 'day').toDate(),
    })

    const trip3 = await makePrismaTrip({
      destination: 'Rio de Janeiro',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: dayjs().subtract(2, 'month').toDate(),
      endsAt: dayjs().subtract(2, 'month').add(4, 'day').toDate(),
    })

    await makePrismaParticipant({
      tripId: trip1.id,
      travelerId: new UniqueEntityID(traveler.id),
    })

    await makePrismaParticipant({
      tripId: trip2.id,
      travelerId: new UniqueEntityID(traveler.id),
    })

    await makePrismaParticipant({
      tripId: trip3.id,
      travelerId: new UniqueEntityID(traveler.id),
    })

    const participantTripsResponse = await request(app.server)
      .get('/traveler/next/trip')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(participantTripsResponse.statusCode).toBe(200)
    expect(participantTripsResponse.body.nextTrip.destination).toBe('Norway')
  })
})

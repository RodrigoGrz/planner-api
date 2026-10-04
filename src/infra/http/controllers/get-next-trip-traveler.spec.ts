import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { app } from '@/infra/app'
import { dayjs } from '@/lib/dayjs'
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

  test('[GET] /me/trips/next', async () => {
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
      .get('/me/trips/next')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(participantTripsResponse.statusCode).toBe(200)
    expect(participantTripsResponse.body.nextTrip.destination).toBe('Norway')
  })

  test('[GET] /me/trips/next returns an ongoing trip', async () => {
    const { token, traveler } = await createAndAuthenticateTraveler(app)
    const today = dayjs.utc().startOf('day')

    const ongoingTrip = await makePrismaTrip({
      destination: 'Lisbon',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: today.subtract(2, 'day').toDate(),
      endsAt: today.add(2, 'day').toDate(),
    })

    const futureTrip = await makePrismaTrip({
      destination: 'Tokyo',
      ownerId: new UniqueEntityID(traveler.id),
      startsAt: today.add(1, 'month').toDate(),
      endsAt: today.add(1, 'month').add(3, 'day').toDate(),
    })

    await makePrismaParticipant({
      tripId: ongoingTrip.id,
      travelerId: new UniqueEntityID(traveler.id),
    })

    await makePrismaParticipant({
      tripId: futureTrip.id,
      travelerId: new UniqueEntityID(traveler.id),
    })

    const response = await request(app.server)
      .get('/me/trips/next')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.nextTrip.tripId).toBe(ongoingTrip.id.toString())
  })
})

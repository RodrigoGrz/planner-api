import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { GetTripActivitiesUseCase } from './get-trip-activities'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { makeActivity } from 'tests/factories/make-activity'
import { dayjs } from '@/lib/dayjs'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { makeParticipant } from 'tests/factories/make-participant'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { MAX_TRIP_DURATION_IN_DAYS } from '../trip-period/trip-duration'

let activitiesRepository: FakeActivitiesRepository
let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let linksRepository: FakeLinksRepository
let participantsRepository: FakeParticipantsRepository
let getTripActivitiesUseCase: GetTripActivitiesUseCase

describe('Get Trip Activities', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    participantsRepository = new FakeParticipantsRepository(tripsRepository)
    getTripActivitiesUseCase = new GetTripActivitiesUseCase(
      tripsRepository,
      participantsRepository,
    )
  })

  it('should be able to get activities from a trip', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: owner.id,
    })

    const trip2 = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)
    tripsRepository.items.push(trip2)

    const activity1 = await makeActivity({
      tripId: trip.id,
      occursAt: dayjs().add(1, 'month').toDate(),
    })

    const activity2 = await makeActivity({
      tripId: trip.id,
      occursAt: dayjs().add(1, 'month').toDate(),
    })

    const activity3 = await makeActivity({
      tripId: trip.id,
      occursAt: dayjs().add(1, 'month').add(1, 'day').toDate(),
    })

    const activity4 = await makeActivity({
      tripId: trip2.id,
      occursAt: dayjs().add(2, 'month').add(1, 'day').toDate(),
    })

    activitiesRepository.items.push(activity1)
    activitiesRepository.items.push(activity2)
    activitiesRepository.items.push(activity3)
    activitiesRepository.items.push(activity4)

    const result = await getTripActivitiesUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.activities).length(4)
    expect(result.isRight() && result.value.activities[0].activities).length(2)
    expect(result.isRight() && result.value.activities[1].activities).length(1)
    expect(result.isRight() && result.value.activities[2].activities).length(0)
  })

  it('should not generate more days than the maximum trip duration', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const startsAt = dayjs().add(1, 'month').toDate()

    const trip = await makeTrip({
      startsAt,
      endsAt: dayjs(startsAt).add(10, 'year').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await getTripActivitiesUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.activities).toHaveLength(
      MAX_TRIP_DURATION_IN_DAYS + 1,
    )
    expect(result.isRight() && result.value.activities[0].date).toEqual(
      dayjs.utc(startsAt).startOf('day').toDate(),
    )
  })

  it('should group activities by UTC day', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: new Date('2026-03-10T00:00:00.000Z'),
      endsAt: new Date('2026-03-12T00:00:00.000Z'),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const lateActivity = await makeActivity({
      tripId: trip.id,
      occursAt: new Date('2026-03-10T23:30:00.000Z'),
    })

    activitiesRepository.items.push(lateActivity)

    const result = await getTripActivitiesUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(
      result.isRight() &&
        result.value.activities[0].activities.map((item) => item.id),
    ).toEqual([lateActivity.id])
    expect(result.isRight() && result.value.activities[1].activities).toEqual(
      [],
    )
  })

  it('should start the first block at midnight UTC of the start day', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: new Date('2026-03-10T15:00:00.000Z'),
      endsAt: new Date('2026-03-12T00:00:00.000Z'),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await getTripActivitiesUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.activities[0].date).toEqual(
      new Date('2026-03-10T00:00:00.000Z'),
    )
  })

  it('should be able to get trip activities as a confirmed participant', async () => {
    const owner = await makeTraveler()
    const guest = await makeTraveler()

    travelersRepository.items.push(owner, guest)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(1, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: guest.id,
      isConfirmed: true,
    })

    participantsRepository.items.push(participant)

    const result = await getTripActivitiesUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: guest.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
  })

  it('should not be able to get trip activities as an unconfirmed participant', async () => {
    const owner = await makeTraveler()
    const guest = await makeTraveler()

    travelersRepository.items.push(owner, guest)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(1, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: guest.id,
      isConfirmed: false,
    })

    participantsRepository.items.push(participant)

    const result = await getTripActivitiesUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: guest.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to get activities of someone else trip', async () => {
    const owner = await makeTraveler()
    const intruder = await makeTraveler()

    travelersRepository.items.push(owner, intruder)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await getTripActivitiesUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: intruder.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to get activities of a trip that does not exist', async () => {
    const result = await getTripActivitiesUseCase.execute({
      tripId: new UniqueEntityID().toString(),
      travelerId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })
})

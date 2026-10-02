import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { UpdateTripUseCase } from './update-trip'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { dayjs } from '@/lib/dayjs'
import { Activity } from '../../enterprise/entities/activity'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from './errors/not-allowed-error'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { InvalidTripDuration } from './errors/invalid-trip-duration-error'
import { MAX_TRIP_DURATION_IN_DAYS } from '../trip-period/trip-duration'

let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let linksRepository: FakeLinksRepository
let updateTripUseCase: UpdateTripUseCase

describe('Update Trip', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    updateTripUseCase = new UpdateTripUseCase(
      tripsRepository,
      activitiesRepository,
    )
  })
  it('should be able to update a trip', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
      destination: 'London',
      startsAt: dayjs().add(2, 'month').toDate(),
      endsAt: dayjs().add(2, 'month').add(4, 'day').toDate(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.trip.destination).toBe('London')
  })

  it('should delete only activities outside the new trip period', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(5, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const newStartsAt = dayjs().add(2, 'month').toDate()
    const newEndsAt = dayjs().add(2, 'month').add(3, 'day').toDate()

    const activityBefore = Activity.create({
      tripId: trip.id,
      occursAt: dayjs(newStartsAt).subtract(1, 'day').toDate(),
      title: 'Before trip',
    })

    const activityInside = Activity.create({
      tripId: trip.id,
      occursAt: dayjs(newStartsAt).add(1, 'day').toDate(),
      title: 'Inside trip',
    })

    const activityAfter = Activity.create({
      tripId: trip.id,
      occursAt: dayjs(newEndsAt).add(1, 'day').toDate(),
      title: 'After trip',
    })

    activitiesRepository.items.push(
      activityBefore,
      activityInside,
      activityAfter,
    )

    const result = await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
      destination: 'London',
      startsAt: newStartsAt,
      endsAt: newEndsAt,
    })

    expect(result.isRight()).toBeTruthy()
    expect(activitiesRepository.items).toHaveLength(1)
    expect(activitiesRepository.items[0].id).toEqual(activityInside.id)
  })

  it('should not be able to update a trip to last more than 30 days', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const originalStartsAt = dayjs().add(1, 'month').toDate()
    const originalEndsAt = dayjs().add(1, 'month').add(4, 'day').toDate()

    const trip = await makeTrip({
      startsAt: originalStartsAt,
      endsAt: originalEndsAt,
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const newStartsAt = dayjs().add(2, 'month').toDate()

    const result = await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
      destination: 'London',
      startsAt: newStartsAt,
      endsAt: dayjs(newStartsAt)
        .add(MAX_TRIP_DURATION_IN_DAYS + 1, 'day')
        .toDate(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidTripDuration)
    expect(tripsRepository.items[0].startsAt).toEqual(originalStartsAt)
    expect(tripsRepository.items[0].endsAt).toEqual(originalEndsAt)
  })

  it('should be able to update a trip to last exactly 30 days', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const newStartsAt = dayjs().add(2, 'month').toDate()
    const newEndsAt = dayjs(newStartsAt)
      .add(MAX_TRIP_DURATION_IN_DAYS, 'day')
      .toDate()

    const result = await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
      destination: 'London',
      startsAt: newStartsAt,
      endsAt: newEndsAt,
    })

    expect(result.isRight()).toBeTruthy()
    expect(tripsRepository.items[0].endsAt).toEqual(newEndsAt)
  })

  it('should not delete activities when the new period is too long', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const activity = Activity.create({
      tripId: trip.id,
      occursAt: dayjs().add(1, 'month').add(1, 'day').toDate(),
      title: 'Inside current trip',
    })

    activitiesRepository.items.push(activity)

    const newStartsAt = dayjs().add(2, 'month').toDate()

    await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
      destination: 'London',
      startsAt: newStartsAt,
      endsAt: dayjs(newStartsAt)
        .add(MAX_TRIP_DURATION_IN_DAYS + 1, 'day')
        .toDate(),
    })

    expect(activitiesRepository.items).toHaveLength(1)
    expect(activitiesRepository.items[0].id).toEqual(activity.id)
  })

  it('should not be able to update a trip if the traveler is not the owner', async () => {
    const owner = await makeTraveler()
    const intruder = await makeTraveler()

    travelersRepository.items.push(owner, intruder)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: intruder.id.toString(),
      destination: 'London',
      startsAt: dayjs().add(2, 'month').toDate(),
      endsAt: dayjs().add(2, 'month').add(4, 'day').toDate(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(trip.destination).toBe('Norway')
  })

  it('should not be able to update a trip that does not exist', async () => {
    const result = await updateTripUseCase.execute({
      tripId: new UniqueEntityID().toString(),
      travelerId: new UniqueEntityID().toString(),
      destination: 'London',
      startsAt: dayjs().add(2, 'month').toDate(),
      endsAt: dayjs().add(2, 'month').add(4, 'day').toDate(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  it('should run the activity cleanup and the trip update in the same transaction', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    let insideTransaction = false
    const writesInsideTransaction: string[] = []

    vi.spyOn(tripsRepository, 'runInTransaction').mockImplementation(
      async (fn) => {
        insideTransaction = true
        const result = await fn()
        insideTransaction = false

        return result
      },
    )

    const deleteOutsideTripPeriod =
      activitiesRepository.deleteOutsideTripPeriod.bind(activitiesRepository)

    vi.spyOn(
      activitiesRepository,
      'deleteOutsideTripPeriod',
    ).mockImplementation(async (...args) => {
      if (insideTransaction) {
        writesInsideTransaction.push('deleteOutsideTripPeriod')
      }

      return deleteOutsideTripPeriod(...args)
    })

    const update = tripsRepository.update.bind(tripsRepository)

    vi.spyOn(tripsRepository, 'update').mockImplementation(async (data) => {
      if (insideTransaction) {
        writesInsideTransaction.push('update')
      }

      return update(data)
    })

    const result = await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
      destination: 'London',
      startsAt: dayjs().add(2, 'month').toDate(),
      endsAt: dayjs().add(2, 'month').add(4, 'day').toDate(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(writesInsideTransaction).toEqual([
      'deleteOutsideTripPeriod',
      'update',
    ])
  })
})

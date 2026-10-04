import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { dayjs } from '@/lib/dayjs'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { DeleteTripActivityUseCase } from './delete-trip-activity'
import { makeActivity } from 'tests/factories/make-activity'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'

let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let activitiesRepository: FakeActivitiesRepository
let linksRepository: FakeLinksRepository
let deleteTripActivityUseCase: DeleteTripActivityUseCase

describe('Delete trip activity', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    deleteTripActivityUseCase = new DeleteTripActivityUseCase(
      activitiesRepository,
      tripsRepository,
    )
  })

  it('should be able to delete a trip activity', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const activity = await makeActivity({
      tripId: trip.id,
    })

    activitiesRepository.items.push(activity)

    const result = await deleteTripActivityUseCase.execute({
      id: activity.id.toString(),
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toBeNull()
    expect(activitiesRepository.items.length).toBe(0)
  })

  it('should not be able to delete a trip activity if ID is wrong', async () => {
    const result = await deleteTripActivityUseCase.execute({
      id: 'wrong-id',
      tripId: 'any-trip',
      travelerId: 'any-traveler',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  it('should not be able to delete a trip activity if the traveler is not the trip owner', async () => {
    const owner = await makeTraveler()
    const intruder = await makeTraveler()

    travelersRepository.items.push(owner, intruder)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const activity = await makeActivity({
      tripId: trip.id,
    })

    activitiesRepository.items.push(activity)

    const result = await deleteTripActivityUseCase.execute({
      id: activity.id.toString(),
      tripId: trip.id.toString(),
      travelerId: intruder.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(activitiesRepository.items).toHaveLength(1)
  })

  it('should not be able to delete an activity that belongs to another trip', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const trip = await makeTrip({ ownerId: owner.id })
    const anotherTrip = await makeTrip({ ownerId: owner.id })
    tripsRepository.items.push(trip, anotherTrip)

    const activity = await makeActivity({ tripId: anotherTrip.id })
    activitiesRepository.items.push(activity)

    const result = await deleteTripActivityUseCase.execute({
      id: activity.id.toString(),
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
    expect(activitiesRepository.items).toHaveLength(1)
  })
})

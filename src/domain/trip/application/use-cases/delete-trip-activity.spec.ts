import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { dayjs } from '@/lib/dayjs'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
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
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toBeNull()
    expect(activitiesRepository.items.length).toBe(0)
  })

  it('should not be able to delete a trip activity if ID is wrong', async () => {
    const result = await deleteTripActivityUseCase.execute({
      id: 'wrong-id',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })
})

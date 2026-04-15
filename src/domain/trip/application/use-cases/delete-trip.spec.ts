import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { DeleteTripUseCase } from './delete-trip'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { dayjs } from '@/lib/dayjs'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { makeActivity } from 'tests/factories/make-activity'
import { makeLink } from 'tests/factories/make-link'
import { NotAllowedError } from './errors/not-allowed-error'

let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let linksRepository: FakeLinksRepository
let deleteTripUseCase: DeleteTripUseCase

describe('Delete trip', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()

    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )

    deleteTripUseCase = new DeleteTripUseCase(tripsRepository)
  })

  it('should be able to delete a trip', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await deleteTripUseCase.execute({
      id: trip.id.toString(),
      userId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toBeNull()
    expect(tripsRepository.items.length).toBe(0)
  })

  it('should not be able to delete a trip if ID is wrong', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const result = await deleteTripUseCase.execute({
      id: 'wrong-id',
      userId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  it('should not be able to delete a trip if user is not the owner', async () => {
    const owner = await makeTraveler()
    const anotherUser = await makeTraveler()

    travelersRepository.items.push(owner)
    travelersRepository.items.push(anotherUser)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await deleteTripUseCase.execute({
      id: trip.id.toString(),
      userId: anotherUser.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(tripsRepository.items.length).toBe(1)
  })

  it('should delete related data when deleting a trip', async () => {
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

    const link = await makeLink({
      tripId: trip.id,
    })

    linksRepository.items.push(link)

    await deleteTripUseCase.execute({
      id: trip.id.toString(),
      userId: owner.id.toString(),
    })

    expect(activitiesRepository.items.length).toBe(0)
    expect(linksRepository.items.length).toBe(0)
  })
})

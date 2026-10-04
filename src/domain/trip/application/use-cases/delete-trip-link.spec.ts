import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { DeleteTripLinkUseCase } from './delete-trip-link'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { makeLink } from 'tests/factories/make-link'
import { dayjs } from '@/lib/dayjs'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'

let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let linksRepository: FakeLinksRepository
let deleteTripLinkUseCase: DeleteTripLinkUseCase

describe('Delete trip link', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    deleteTripLinkUseCase = new DeleteTripLinkUseCase(
      linksRepository,
      tripsRepository,
    )
  })

  it('should be able to delete a trip link', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const link = await makeLink({
      tripId: trip.id,
    })

    linksRepository.items.push(link)

    const result = await deleteTripLinkUseCase.execute({
      id: link.id.toString(),
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toBeNull()
    expect(linksRepository.items.length).toBe(0)
  })

  it('should not be able to delete a trip link if ID is wrong', async () => {
    const result = await deleteTripLinkUseCase.execute({
      id: 'wrong-id',
      tripId: 'any-trip',
      travelerId: 'any-traveler',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  it('should not be able to delete a trip link if the traveler is not the trip owner', async () => {
    const owner = await makeTraveler()
    const intruder = await makeTraveler()

    travelersRepository.items.push(owner, intruder)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const link = await makeLink({
      tripId: trip.id,
    })

    linksRepository.items.push(link)

    const result = await deleteTripLinkUseCase.execute({
      id: link.id.toString(),
      tripId: trip.id.toString(),
      travelerId: intruder.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(linksRepository.items).toHaveLength(1)
  })

  it('should not be able to delete a link that belongs to another trip', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const trip = await makeTrip({ ownerId: owner.id })
    const anotherTrip = await makeTrip({ ownerId: owner.id })
    tripsRepository.items.push(trip, anotherTrip)

    const link = await makeLink({ tripId: anotherTrip.id })
    linksRepository.items.push(link)

    const result = await deleteTripLinkUseCase.execute({
      id: link.id.toString(),
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
    expect(linksRepository.items).toHaveLength(1)
  })
})

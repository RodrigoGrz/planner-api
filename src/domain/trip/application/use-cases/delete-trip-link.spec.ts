import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { DeleteTripLinkUseCase } from './delete-trip-link'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { makeLink } from 'tests/factories/make-link'
import dayjs from 'dayjs'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'

let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let linksRepository: FakeLinksRepository
let deleteTripLinkUseCase: DeleteTripLinkUseCase

describe('Delete trip link', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
    )
    linksRepository = new FakeLinksRepository()
    deleteTripLinkUseCase = new DeleteTripLinkUseCase(linksRepository)
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
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toBeNull()
  })

  it('should not be able to delete a trip link if ID is wrong', async () => {
    const result = await deleteTripLinkUseCase.execute({
      id: 'wrong-id',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })
})

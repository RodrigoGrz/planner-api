import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { GetTripLinksUseCase } from './get-trip-links'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { makeTrip } from 'tests/factories/make-trip'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeLink } from 'tests/factories/make-link'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'

let activitiesRepository: FakeActivitiesRepository
let linksRepository: FakeLinksRepository
let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let getTripLinksUseCase: GetTripLinksUseCase

describe('Get Trip Links', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    getTripLinksUseCase = new GetTripLinksUseCase(linksRepository)
  })

  it('should be able to get all links by trip id', async () => {
    const owner1 = await makeTraveler()
    const owner2 = await makeTraveler()

    travelersRepository.items.push(owner1)
    travelersRepository.items.push(owner2)

    const trip1 = await makeTrip({
      ownerId: owner1.id,
    })
    const trip2 = await makeTrip({
      ownerId: owner2.id,
    })

    tripsRepository.items.push(trip1)
    tripsRepository.items.push(trip2)

    const link1 = await makeLink({
      tripId: trip1.id,
    })

    const link2 = await makeLink({
      tripId: trip1.id,
    })

    const link3 = await makeLink({
      tripId: trip2.id,
    })

    linksRepository.items.push(link1)
    linksRepository.items.push(link2)
    linksRepository.items.push(link3)

    const result = await getTripLinksUseCase.execute({
      tripId: trip1.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value?.links).length(2)
    expect(linksRepository.items.length).toBe(3)
  })
})

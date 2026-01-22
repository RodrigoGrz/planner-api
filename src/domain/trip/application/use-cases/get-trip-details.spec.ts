import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { GetTripDetailsUseCase } from './get-trip-details'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'

let activitiesRepository: FakeActivitiesRepository
let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let getTripDetailsUseCase: GetTripDetailsUseCase

describe('Get Trip Details', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
    )
    getTripDetailsUseCase = new GetTripDetailsUseCase(tripsRepository)
  })

  it('should be able to get trip details', async () => {
    const owner = await makeTraveler({
      name: 'Teste',
    })

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await getTripDetailsUseCase.execute({
      id: trip.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.tripWithOwner.ownerName).toBe(
      'Teste',
    )
  })
})

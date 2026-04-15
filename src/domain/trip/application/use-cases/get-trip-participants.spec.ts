import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { GetTripParticipantsUseCase } from './get-trip-participants'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { makeParticipant } from 'tests/factories/make-participant'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'

let activitiesRepository: FakeActivitiesRepository
let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let linksRepository: FakeLinksRepository
let participantsRepository: FakeParticipantsRepository
let getTripParticipantsUseCase: GetTripParticipantsUseCase

describe('Get Trip Participants', () => {
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
    getTripParticipantsUseCase = new GetTripParticipantsUseCase(
      participantsRepository,
    )
  })

  it('should be able to get all trip participants', async () => {
    const owner = await makeTraveler({
      name: 'Teste',
    })

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    const trip2 = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)
    tripsRepository.items.push(trip2)

    const participant1 = await makeParticipant({
      tripId: trip.id,
    })

    const participant2 = await makeParticipant({
      tripId: trip.id,
    })

    const participant3 = await makeParticipant({
      tripId: trip2.id,
    })

    participantsRepository.items.push(participant1)
    participantsRepository.items.push(participant2)
    participantsRepository.items.push(participant3)

    const result = await getTripParticipantsUseCase.execute({
      tripId: trip.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.participants).length(2)
    expect(participantsRepository.items.length).toBe(3)
  })
})

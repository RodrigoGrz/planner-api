import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { makeParticipant } from 'tests/factories/make-participant'
import { GetAllTravelersByTripUseCase } from './get-all-travelers-by-trips'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'

let activitiesRepository: FakeActivitiesRepository
let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let participantsRepository: FakeParticipantsRepository
let linksRepository: FakeLinksRepository
let getAllTravelersByTripUseCase: GetAllTravelersByTripUseCase

describe('Get All Travelers By Trip', () => {
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
    getAllTravelersByTripUseCase = new GetAllTravelersByTripUseCase(
      participantsRepository,
      travelersRepository,
    )
  })

  it('should be able to get all trips by traveler id', async () => {
    const traveler = await makeTraveler()
    const traveler2 = await makeTraveler()

    travelersRepository.items.push(traveler)
    travelersRepository.items.push(traveler2)

    const trip = await makeTrip({
      ownerId: traveler.id,
      destination: 'Miami',
    })

    const trip2 = await makeTrip({
      ownerId: traveler2.id,
      destination: 'London',
    })

    const trip3 = await makeTrip({
      ownerId: traveler.id,
      destination: 'Norway',
    })

    const trip4 = await makeTrip({
      ownerId: traveler.id,
    })

    tripsRepository.items.push(trip)
    tripsRepository.items.push(trip2)
    tripsRepository.items.push(trip3)
    tripsRepository.items.push(trip4)

    const participant = await makeParticipant({
      travelerId: traveler.id,
      tripId: trip.id,
    })

    const participant2 = await makeParticipant({
      travelerId: traveler2.id,
      tripId: trip2.id,
    })

    const participant3 = await makeParticipant({
      travelerId: traveler.id,
      tripId: trip.id,
    })

    const participant4 = await makeParticipant({
      travelerId: traveler.id,
      tripId: trip.id,
    })

    const participant5 = await makeParticipant({
      travelerId: null,
      tripId: trip.id,
    })

    const participant6 = await makeParticipant({
      travelerId: null,
      tripId: trip2.id,
    })

    participantsRepository.items.push(participant)
    participantsRepository.items.push(participant2)
    participantsRepository.items.push(participant3)
    participantsRepository.items.push(participant4)
    participantsRepository.items.push(participant5)
    participantsRepository.items.push(participant6)

    const result = await getAllTravelersByTripUseCase.execute({
      travelerId: traveler.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(participantsRepository.items.length).toBe(6)
    expect(tripsRepository.items.length).toBe(4)
    expect(
      result.isRight() && result.value.participantsWithTrip[0].destination,
    ).toBe('Miami')
    expect(result.isRight() && result.value.participantsWithTrip.length).toBe(3)
  })
})

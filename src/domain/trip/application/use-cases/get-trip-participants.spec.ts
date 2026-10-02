import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { GetTripParticipantsUseCase } from './get-trip-participants'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { makeParticipant } from 'tests/factories/make-participant'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'

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
      tripsRepository,
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
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.participants).length(2)
    expect(participantsRepository.items.length).toBe(3)
  })

  it('should be able to get trip participants as a confirmed participant', async () => {
    const owner = await makeTraveler()
    const guest = await makeTraveler()

    travelersRepository.items.push(owner, guest)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: guest.id,
      isConfirmed: true,
    })

    participantsRepository.items.push(participant)

    const result = await getTripParticipantsUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: guest.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.participants).length(1)
  })

  it('should not be able to get trip participants as an unconfirmed participant', async () => {
    const owner = await makeTraveler()
    const guest = await makeTraveler()

    travelersRepository.items.push(owner, guest)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: guest.id,
      isConfirmed: false,
    })

    participantsRepository.items.push(participant)

    const result = await getTripParticipantsUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: guest.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to get participants of someone else trip', async () => {
    const owner = await makeTraveler()
    const intruder = await makeTraveler()

    travelersRepository.items.push(owner, intruder)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await getTripParticipantsUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: intruder.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to get participants of a trip that does not exist', async () => {
    const result = await getTripParticipantsUseCase.execute({
      tripId: new UniqueEntityID().toString(),
      travelerId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })
})

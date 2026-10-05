import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { makeParticipant } from 'tests/factories/make-participant'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { RemoveTripParticipantUseCase } from './remove-trip-participant'
import { NotAllowedError } from './errors/not-allowed-error'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { OwnerCannotLeaveTripError } from './errors/owner-cannot-leave-trip-error'

let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let participantsRepository: FakeParticipantsRepository
let removeTripParticipantUseCase: RemoveTripParticipantUseCase

describe('Remove Trip Participant', () => {
  beforeEach(() => {
    travelersRepository = new FakeTravelersRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      new FakeActivitiesRepository(),
      new FakeLinksRepository(),
    )
    participantsRepository = new FakeParticipantsRepository(tripsRepository)
    removeTripParticipantUseCase = new RemoveTripParticipantUseCase(
      participantsRepository,
      tripsRepository,
    )
  })

  async function makeScenario() {
    const owner = await makeTraveler()
    const trip = await makeTrip({ ownerId: owner.id })
    const ownerParticipant = await makeParticipant({
      tripId: trip.id,
      travelerId: owner.id,
      isConfirmed: true,
    })

    travelersRepository.items.push(owner)
    tripsRepository.items.push(trip)
    participantsRepository.items.push(ownerParticipant)

    return { owner, trip, ownerParticipant }
  }

  it('should be able to remove a participant from the trip', async () => {
    const { owner, trip } = await makeScenario()
    const participant = await makeParticipant({
      tripId: trip.id,
      isConfirmed: true,
    })

    participantsRepository.items.push(participant)

    const result = await removeTripParticipantUseCase.execute({
      tripId: trip.id.toString(),
      participantId: participant.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(
      await participantsRepository.findById(participant.id.toString()),
    ).toBeNull()
  })

  it('should be able to remove a pending participant', async () => {
    const { owner, trip } = await makeScenario()
    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: null,
      isConfirmed: false,
    })

    participantsRepository.items.push(participant)

    const result = await removeTripParticipantUseCase.execute({
      tripId: trip.id.toString(),
      participantId: participant.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(
      await participantsRepository.findById(participant.id.toString()),
    ).toBeNull()
  })

  it('should not be able to remove a participant when the traveler is not the owner', async () => {
    const { trip } = await makeScenario()
    const intruder = await makeTraveler()
    const participant = await makeParticipant({ tripId: trip.id })

    participantsRepository.items.push(participant)

    const result = await removeTripParticipantUseCase.execute({
      tripId: trip.id.toString(),
      participantId: participant.id.toString(),
      travelerId: intruder.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(
      await participantsRepository.findById(participant.id.toString()),
    ).not.toBeNull()
  })

  it('should not be able to remove a participant of another trip', async () => {
    const { owner, trip } = await makeScenario()
    const otherTrip = await makeTrip({ ownerId: owner.id })
    const participant = await makeParticipant({ tripId: otherTrip.id })

    tripsRepository.items.push(otherTrip)
    participantsRepository.items.push(participant)

    const result = await removeTripParticipantUseCase.execute({
      tripId: trip.id.toString(),
      participantId: participant.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
    expect(
      await participantsRepository.findById(participant.id.toString()),
    ).not.toBeNull()
  })

  it('should not be able to remove a participant that does not exist', async () => {
    const { owner, trip } = await makeScenario()

    const result = await removeTripParticipantUseCase.execute({
      tripId: trip.id.toString(),
      participantId: new UniqueEntityID().toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  it('should not be able to remove the owner from the trip', async () => {
    const { owner, trip, ownerParticipant } = await makeScenario()

    const result = await removeTripParticipantUseCase.execute({
      tripId: trip.id.toString(),
      participantId: ownerParticipant.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(OwnerCannotLeaveTripError)
    expect(
      await participantsRepository.findById(ownerParticipant.id.toString()),
    ).not.toBeNull()
  })
})

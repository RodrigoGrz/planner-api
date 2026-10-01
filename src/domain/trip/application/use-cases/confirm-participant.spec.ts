import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { makeParticipant } from 'tests/factories/make-participant'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { ConfirmParticipantUseCase } from './confirm-participant'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { ParticipantProps } from '../../enterprise/entities/participant'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let activitiesRepository: FakeActivitiesRepository
let travelersRepository: FakeTravelersRepository
let linksRepository: FakeLinksRepository
let tripsRepository: FakeTripsRepository
let participantsRepository: FakeParticipantsRepository
let confirmParticipantUseCase: ConfirmParticipantUseCase

describe('Confirm Participant', () => {
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
    confirmParticipantUseCase = new ConfirmParticipantUseCase(
      participantsRepository,
      tripsRepository,
      travelersRepository,
    )
  })

  async function makeScenario(
    participantOverride: Partial<ParticipantProps> = {},
  ) {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      destination: 'Norway',
      ownerId: owner.id,
    })
    tripsRepository.items.push(trip)

    const participant = await makeParticipant({
      tripId: trip.id,
      isConfirmed: false,
      confirmationToken: 'valid-token',
      ...participantOverride,
    })
    participantsRepository.items.push(participant)

    return { trip, participant }
  }

  it('should be able to confirm a participant through the confirmation token', async () => {
    const { participant } = await makeScenario()

    const result = await confirmParticipantUseCase.execute({
      token: 'valid-token',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.destination).toBe('Norway')
    expect(participantsRepository.items[0].isConfirmed).toBe(true)
    expect(participantsRepository.items[0].id.toString()).toBe(
      participant.id.toString(),
    )
  })

  it('should invalidate the confirmation token after use', async () => {
    await makeScenario()

    await confirmParticipantUseCase.execute({ token: 'valid-token' })

    expect(participantsRepository.items[0].confirmationToken).toBeNull()

    const result = await confirmParticipantUseCase.execute({
      token: 'valid-token',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  it('should not be able to confirm a participant with an unknown token', async () => {
    await makeScenario()

    const result = await confirmParticipantUseCase.execute({
      token: 'unknown-token',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
    expect(participantsRepository.items[0].isConfirmed).toBe(false)
  })

  it('should link the participant to an existing traveler with the same e-mail on confirmation', async () => {
    const invitedTraveler = await makeTraveler({
      name: 'Invited Traveler',
      email: 'invited@planner.com',
    })
    travelersRepository.items.push(invitedTraveler)

    await makeScenario({
      email: 'invited@planner.com',
      name: null,
      travelerId: null,
    })

    const result = await confirmParticipantUseCase.execute({
      token: 'valid-token',
    })

    expect(result.isRight()).toBeTruthy()
    expect(participantsRepository.items[0].isConfirmed).toBe(true)
    expect(participantsRepository.items[0].travelerId?.toString()).toBe(
      invitedTraveler.id.toString(),
    )
    expect(participantsRepository.items[0].name).toBe('Invited Traveler')
  })

  it('should confirm without linking when no traveler has the e-mail', async () => {
    await makeScenario({
      email: 'not-registered@planner.com',
      name: null,
      travelerId: null,
    })

    const result = await confirmParticipantUseCase.execute({
      token: 'valid-token',
    })

    expect(result.isRight()).toBeTruthy()
    expect(participantsRepository.items[0].isConfirmed).toBe(true)
    expect(participantsRepository.items[0].travelerId).toBeNull()
  })

  it('should keep the existing traveler when the participant is already linked', async () => {
    const otherTraveler = await makeTraveler({ email: 'invited@planner.com' })
    travelersRepository.items.push(otherTraveler)

    const linkedTravelerId = new UniqueEntityID()

    await makeScenario({
      email: 'invited@planner.com',
      travelerId: linkedTravelerId,
    })

    await confirmParticipantUseCase.execute({ token: 'valid-token' })

    expect(participantsRepository.items[0].travelerId?.toString()).toBe(
      linkedTravelerId.toString(),
    )
  })
})

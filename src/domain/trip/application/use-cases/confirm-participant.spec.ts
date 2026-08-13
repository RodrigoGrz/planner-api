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
    )
  })

  async function makeScenario() {
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
})

import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { FakeTransactionManager } from 'tests/transaction/fake-transaction-manager'
import { RegisterTravelerUseCase } from './register-traveler'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeParticipant } from 'tests/factories/make-participant'
import { TravelerAlreadyExistsError } from './errors/traveler-already-exists-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let travelersRepository: FakeTravelersRepository
let participantsRepository: FakeParticipantsRepository
let registerTravelerUseCase: RegisterTravelerUseCase

const travelerData = {
  name: 'John Doe',
  email: 'johndoe@planner.com',
  password: '123456',
  phone: '55009999999',
}

describe('Register Traveler', () => {
  beforeEach(() => {
    travelersRepository = new FakeTravelersRepository()
    participantsRepository = new FakeParticipantsRepository(
      new FakeTripsRepository(
        travelersRepository,
        new FakeActivitiesRepository(),
        new FakeLinksRepository(),
      ),
    )
    registerTravelerUseCase = new RegisterTravelerUseCase(
      travelersRepository,
      participantsRepository,
      new FakeTransactionManager(),
    )
  })

  it('should be able to register a traveler', async () => {
    const result = await registerTravelerUseCase.execute(travelerData)

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.traveler).toHaveProperty('id')
    expect(result.isRight() && result.value.traveler.email).toEqual(
      'johndoe@planner.com',
    )
  })

  it('should not be able to register an already exists traveler e-mail', async () => {
    const traveler = await makeTraveler({
      email: 'johndoe@planner.com',
    })

    travelersRepository.items.push(traveler)

    const result = await registerTravelerUseCase.execute(travelerData)

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(TravelerAlreadyExistsError)
  })

  it('should link pending invites with the same e-mail to the new traveler', async () => {
    const firstInvite = await makeParticipant({
      email: travelerData.email,
      name: null,
      travelerId: null,
    })
    const secondInvite = await makeParticipant({
      email: travelerData.email,
      name: null,
      travelerId: null,
    })

    participantsRepository.items.push(firstInvite, secondInvite)

    const result = await registerTravelerUseCase.execute(travelerData)

    if (result.isLeft()) {
      throw result.value
    }

    const { traveler } = result.value

    expect(participantsRepository.items).toHaveLength(2)

    for (const participant of participantsRepository.items) {
      expect(participant.travelerId?.toString()).toBe(traveler.id.toString())
      expect(participant.name).toBe('John Doe')
    }
  })

  it('should not link participants already linked to another traveler', async () => {
    const otherTravelerId = new UniqueEntityID()
    const linkedParticipant = await makeParticipant({
      email: travelerData.email,
      name: 'Other Traveler',
      travelerId: otherTravelerId,
    })

    participantsRepository.items.push(linkedParticipant)

    await registerTravelerUseCase.execute(travelerData)

    expect(participantsRepository.items[0].travelerId?.toString()).toBe(
      otherTravelerId.toString(),
    )
    expect(participantsRepository.items[0].name).toBe('Other Traveler')
  })

  it('should not link participants with a different e-mail', async () => {
    const otherInvite = await makeParticipant({
      email: 'someone-else@planner.com',
      name: null,
      travelerId: null,
    })

    participantsRepository.items.push(otherInvite)

    await registerTravelerUseCase.execute(travelerData)

    expect(participantsRepository.items[0].travelerId).toBeNull()
  })

  it('should not link invites when the e-mail is already registered', async () => {
    const existingTraveler = await makeTraveler({ email: travelerData.email })
    const pendingInvite = await makeParticipant({
      email: travelerData.email,
      name: null,
      travelerId: null,
    })

    travelersRepository.items.push(existingTraveler)
    participantsRepository.items.push(pendingInvite)

    const result = await registerTravelerUseCase.execute(travelerData)

    expect(result.value).toBeInstanceOf(TravelerAlreadyExistsError)
    expect(participantsRepository.items[0].travelerId).toBeNull()
  })
})

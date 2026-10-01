import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeMailer } from 'tests/mail/faker-mailer'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { CreateInviteUseCase } from './create-invite'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'

let activitiesRepository: FakeActivitiesRepository
let travelersRepository: FakeTravelersRepository
let linksRepository: FakeLinksRepository
let tripsRepository: FakeTripsRepository
let participantsRepository: FakeParticipantsRepository
let mailer: FakeMailer
let createInviteUseCase: CreateInviteUseCase

describe('Create Invite', () => {
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
    mailer = new FakeMailer()
    createInviteUseCase = new CreateInviteUseCase(
      tripsRepository,
      participantsRepository,
      travelersRepository,
      mailer,
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

    return { owner, trip }
  }

  it('should be able to invite a participant to a trip', async () => {
    const { owner, trip } = await makeScenario()

    const result = await createInviteUseCase.execute({
      tripId: trip.id.toString(),
      email: 'invited@planner.com',
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(participantsRepository.items).toHaveLength(1)
    expect(participantsRepository.items[0]).toMatchObject({
      email: 'invited@planner.com',
      isConfirmed: false,
    })
    expect(participantsRepository.items[0].tripId.toString()).toBe(
      trip.id.toString(),
    )
    expect(participantsRepository.items[0].confirmationToken).toEqual(
      expect.any(String),
    )
  })

  it('should send an invite e-mail with a token based confirmation link', async () => {
    const { owner, trip } = await makeScenario()

    await createInviteUseCase.execute({
      tripId: trip.id.toString(),
      email: 'invited@planner.com',
      travelerId: owner.id.toString(),
    })

    const participant = participantsRepository.items[0]

    expect(mailer.sentMails).toHaveLength(1)
    expect(mailer.sentMails[0].to).toBe('invited@planner.com')
    expect(mailer.sentMails[0].html).toContain(
      `token=${participant.confirmationToken}`,
    )
    expect(mailer.sentMails[0].html).not.toContain(participant.id.toString())
  })

  it('should generate a different confirmation token for each invite', async () => {
    const { owner, trip } = await makeScenario()

    await createInviteUseCase.execute({
      tripId: trip.id.toString(),
      email: 'first@planner.com',
      travelerId: owner.id.toString(),
    })

    await createInviteUseCase.execute({
      tripId: trip.id.toString(),
      email: 'second@planner.com',
      travelerId: owner.id.toString(),
    })

    const [first, second] = participantsRepository.items

    expect(first.confirmationToken).not.toBe(second.confirmationToken)
  })

  it('should link the invite to an existing traveler with the same e-mail', async () => {
    const { owner, trip } = await makeScenario()

    const invitedTraveler = await makeTraveler({
      name: 'John Doe',
      email: 'john@planner.com',
    })
    travelersRepository.items.push(invitedTraveler)

    await createInviteUseCase.execute({
      tripId: trip.id.toString(),
      email: 'john@planner.com',
      travelerId: owner.id.toString(),
    })

    const participant = participantsRepository.items[0]

    expect(participant.travelerId?.toString()).toBe(
      invitedTraveler.id.toString(),
    )
    expect(participant.name).toBe('John Doe')
  })

  it('should not be able to invite to a non-existing trip', async () => {
    const { owner } = await makeScenario()

    const result = await createInviteUseCase.execute({
      tripId: 'non-existing-trip-id',
      email: 'invited@planner.com',
      travelerId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
    expect(participantsRepository.items).toHaveLength(0)
    expect(mailer.sentMails).toHaveLength(0)
  })

  it('should not be able to invite when the traveler is not the trip owner', async () => {
    const { trip } = await makeScenario()

    const intruder = await makeTraveler()
    travelersRepository.items.push(intruder)

    const result = await createInviteUseCase.execute({
      tripId: trip.id.toString(),
      email: 'invited@planner.com',
      travelerId: intruder.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(participantsRepository.items).toHaveLength(0)
    expect(mailer.sentMails).toHaveLength(0)
  })
})

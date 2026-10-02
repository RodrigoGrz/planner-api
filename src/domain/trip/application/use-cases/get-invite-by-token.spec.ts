import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { makeParticipant } from 'tests/factories/make-participant'
import { makeTrip } from 'tests/factories/make-trip'
import { GetInviteByTokenUseCase } from './get-invite-by-token'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { InviteExpiredError } from './errors/invite-expired-error'

let tripsRepository: FakeTripsRepository
let participantsRepository: FakeParticipantsRepository
let getInviteByTokenUseCase: GetInviteByTokenUseCase

describe('Get Invite By Token', () => {
  beforeEach(() => {
    tripsRepository = new FakeTripsRepository(
      new FakeTravelersRepository(),
      new FakeActivitiesRepository(),
      new FakeLinksRepository(),
    )
    participantsRepository = new FakeParticipantsRepository(tripsRepository)
    getInviteByTokenUseCase = new GetInviteByTokenUseCase(
      participantsRepository,
      tripsRepository,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function makeInvite() {
    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: new Date('2026-03-10T00:00:00.000Z'),
      endsAt: new Date('2026-03-14T00:00:00.000Z'),
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

  it('should be able to get the invite and its trip by token', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'))

    const { trip, participant } = await makeInvite()

    const result = await getInviteByTokenUseCase.execute({
      token: 'valid-token',
    })

    expect(result.isRight()).toBe(true)
    expect(result.isRight() && result.value.participant.id).toEqual(
      participant.id,
    )
    expect(result.isRight() && result.value.trip.id).toEqual(trip.id)
  })

  it('should not confirm the participant when getting the invite', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'))

    await makeInvite()

    await getInviteByTokenUseCase.execute({ token: 'valid-token' })

    expect(participantsRepository.items[0].isConfirmed).toBe(false)
    expect(participantsRepository.items[0].confirmationToken).toBe(
      'valid-token',
    )
  })

  it('should not be able to get an invite with an unknown token', async () => {
    await makeInvite()

    const result = await getInviteByTokenUseCase.execute({
      token: 'unknown-token',
    })

    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  it('should not be able to get an invite for a trip that already ended', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-15T00:00:00.000Z'))

    await makeInvite()

    const result = await getInviteByTokenUseCase.execute({
      token: 'valid-token',
    })

    expect(result.value).toBeInstanceOf(InviteExpiredError)
  })
})

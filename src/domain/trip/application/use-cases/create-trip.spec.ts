import { dayjs } from '@/lib/dayjs'
import { makeTraveler } from 'tests/factories/make-traveler'
import { CreateTripUseCase } from './create-trip'
import { FakeMailer } from 'tests/mail/faker-mailer'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { InvalidTripStartDate } from './errors/invalid-trip-start-date-error'
import { InvalidTripEndDate } from './errors/invalid-trip-end-date-error'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { InvalidTripDuration } from './errors/invalid-trip-duration-error'

let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let participantsRepository: FakeParticipantsRepository
let linksRepository: FakeLinksRepository
let createTripUseCase: CreateTripUseCase
let mailer: FakeMailer

describe('Create Trip', () => {
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
    createTripUseCase = new CreateTripUseCase(
      tripsRepository,
      travelersRepository,
      participantsRepository,
      mailer,
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to create a trip', async () => {
    const startsAt = dayjs().add(1, 'month').toDate()
    const endsAt = dayjs().add(1, 'month').add(4, 'day').toDate()

    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const findManySpy = vi.spyOn(travelersRepository, 'findManyByEmails')

    const result = await createTripUseCase.execute({
      destination: 'Punta Cana',
      startsAt,
      endsAt,
      ownerId: owner.id.toString(),
      emailsToInvite: ['test@planner.com', 'test2@planner.com'],
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.trip).toHaveProperty('id')
    }
    expect(travelersRepository.items.length).toBe(1)
    expect(participantsRepository.items.length).toBe(3)
    expect(mailer.sentMails.length).toBe(2)
    expect(findManySpy).toHaveBeenCalledTimes(1)

    const invited = participantsRepository.items.filter((p) => !p.isConfirmed)
    const tokens = invited.map((p) => p.confirmationToken)

    expect(tokens.filter(Boolean)).length(2)
    expect(new Set(tokens).size).toBe(2)

    for (const token of tokens) {
      expect(
        mailer.sentMails.some((mail) =>
          mail.html.includes(`/invites/confirmation?token=${token}`),
        ),
      ).toBe(true)
    }
  })

  it('should be able to create the trip even when an invite e-mail fails', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    mailer.failingAddresses.add('fail@planner.com')

    const result = await createTripUseCase.execute({
      destination: 'Punta Cana',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id.toString(),
      emailsToInvite: ['fail@planner.com', 'ok@planner.com'],
    })

    expect(result.isRight()).toBeTruthy()
    expect(tripsRepository.items).toHaveLength(1)
    expect(participantsRepository.items.map((p) => p.email)).toEqual(
      expect.arrayContaining([
        owner.email,
        'fail@planner.com',
        'ok@planner.com',
      ]),
    )
  })

  it('should be able to send the remaining invites when one of them fails', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    mailer.failingAddresses.add('fail@planner.com')

    await createTripUseCase.execute({
      destination: 'Punta Cana',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id.toString(),
      emailsToInvite: ['fail@planner.com', 'ok@planner.com', 'ok2@planner.com'],
    })

    expect(mailer.sentMails.map((mail) => mail.to)).toEqual([
      'ok@planner.com',
      'ok2@planner.com',
    ])
  })

  it('should be able to report the invites whose e-mail failed', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    mailer.failingAddresses.add('fail@planner.com')

    const result = await createTripUseCase.execute({
      destination: 'Punta Cana',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id.toString(),
      emailsToInvite: ['fail@planner.com', 'ok@planner.com'],
    })

    const failedParticipant = participantsRepository.items.find(
      (p) => p.email === 'fail@planner.com',
    )

    expect(result.isRight() && result.value.failedInvites).toEqual([
      {
        participantId: failedParticipant?.id.toString(),
        reason: expect.any(Error),
      },
    ])
  })

  it('should not report failed invites when every e-mail is sent', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const result = await createTripUseCase.execute({
      destination: 'Punta Cana',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id.toString(),
      emailsToInvite: ['ok@planner.com'],
    })

    expect(result.isRight() && result.value.failedInvites).toEqual([])
  })

  it('should not be able to create a trip if starts at is before today', async () => {
    const startsAt = dayjs().subtract(1, 'month').toDate()
    const endsAt = dayjs().add(1, 'month').add(4, 'day').toDate()

    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const result = await createTripUseCase.execute({
      destination: 'Chile',
      startsAt,
      endsAt,
      ownerId: owner.id.toString(),
      emailsToInvite: [],
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidTripStartDate)
  })

  it('should not be able to create a trip if ends at is before starts at', async () => {
    const startsAt = dayjs().add(1, 'month').toDate()
    const endsAt = dayjs().add(1, 'day').toDate()

    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const result = await createTripUseCase.execute({
      destination: 'New York',
      startsAt,
      endsAt,
      ownerId: owner.id.toString(),
      emailsToInvite: [],
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidTripEndDate)
  })

  it('should not be able to create a trip if owner is not a traveler', async () => {
    const startsAt = dayjs().add(1, 'month').toDate()
    const endsAt = dayjs().add(1, 'month').add(4, 'day').toDate()

    const owner = await makeTraveler()

    const result = await createTripUseCase.execute({
      destination: 'Japan',
      startsAt,
      endsAt,
      ownerId: owner.id.toString(),
      emailsToInvite: ['test@planner.com', 'test2@planner.com'],
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  describe('with e-mails in different casing', () => {
    async function createTripInviting(emailsToInvite: string[]) {
      const owner = await makeTraveler({ email: 'owner@planner.com' })
      travelersRepository.items.push(owner)

      await createTripUseCase.execute({
        destination: 'Casing',
        startsAt: dayjs().add(1, 'month').toDate(),
        endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
        ownerId: owner.id.toString(),
        emailsToInvite,
      })
    }

    it('should not invite the owner when the e-mail casing differs', async () => {
      await createTripInviting(['  Owner@Planner.COM '])

      expect(participantsRepository.items).toHaveLength(1)
      expect(participantsRepository.items[0].isConfirmed).toBe(true)
      expect(mailer.sentMails).toHaveLength(0)
    })

    it('should deduplicate invites that differ only by casing', async () => {
      await createTripInviting(['guest@planner.com', 'Guest@Planner.com'])

      const invited = participantsRepository.items.filter(
        (participant) => !participant.isConfirmed,
      )

      expect(invited.map((participant) => participant.email)).toEqual([
        'guest@planner.com',
      ])
    })

    it('should link an invite to an existing traveler regardless of e-mail casing', async () => {
      const guest = await makeTraveler({ email: 'guest@planner.com' })
      travelersRepository.items.push(guest)

      await createTripInviting(['GUEST@planner.com'])

      const invited = participantsRepository.items.find(
        (participant) => !participant.isConfirmed,
      )

      expect(invited?.travelerId?.toString()).toBe(guest.id.toString())
    })
  })

  it('should prevent duplicate participants per trip', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    await createTripUseCase.execute({
      destination: 'Test',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id.toString(),
      emailsToInvite: ['test@planner.com', 'test@planner.com'],
    })

    expect(participantsRepository.items.length).toBe(2)
  })

  it('should allow trip starting today at midnight', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const todayMidnight = dayjs.utc().startOf('day').toDate()

    const result = await createTripUseCase.execute({
      destination: 'Test',
      startsAt: todayMidnight,
      endsAt: dayjs(todayMidnight).add(1, 'day').toDate(),
      ownerId: owner.id.toString(),
      emailsToInvite: [],
    })

    expect(result.isRight()).toBe(true)
  })

  it('should store the trip period normalized to whole UTC days', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'))

    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const result = await createTripUseCase.execute({
      destination: 'Normalized',
      startsAt: new Date('2026-03-10T15:00:00.000Z'),
      endsAt: new Date('2026-03-14T08:00:00.000Z'),
      ownerId: owner.id.toString(),
      emailsToInvite: [],
    })

    expect(result.isRight()).toBe(true)
    expect(tripsRepository.items[0].startsAt).toEqual(
      new Date('2026-03-10T00:00:00.000Z'),
    )
    expect(tripsRepository.items[0].endsAt).toEqual(
      new Date('2026-03-14T00:00:00.000Z'),
    )
  })

  it('should not allow trip with duration greater than 30 days', async () => {
    const startsAt = dayjs().add(1, 'month').toDate()
    const endsAt = dayjs(startsAt).add(31, 'day').toDate()

    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const result = await createTripUseCase.execute({
      destination: 'Long Trip',
      startsAt,
      endsAt,
      ownerId: owner.id.toString(),
      emailsToInvite: [],
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidTripDuration)
  })

  it('should allow trip with exactly 30 days duration', async () => {
    const startsAt = dayjs().add(1, 'month').toDate()
    const endsAt = dayjs(startsAt).add(30, 'day').toDate()

    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const result = await createTripUseCase.execute({
      destination: 'Exact Limit Trip',
      startsAt,
      endsAt,
      ownerId: owner.id.toString(),
      emailsToInvite: [],
    })

    expect(result.isRight()).toBeTruthy()
  })
})

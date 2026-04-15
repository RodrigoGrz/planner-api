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

    const todayMidnight = dayjs().startOf('day').toDate()

    const result = await createTripUseCase.execute({
      destination: 'Test',
      startsAt: todayMidnight,
      endsAt: dayjs(todayMidnight).add(1, 'day').toDate(),
      ownerId: owner.id.toString(),
      emailsToInvite: [],
    })

    expect(result.isRight()).toBe(true)
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

import dayjs from 'dayjs'
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

let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let participantsRepository: FakeParticipantsRepository
let createTripUseCase: CreateTripUseCase
let mailer: FakeMailer

describe('Create Trip', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
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

    const result = await createTripUseCase.execute({
      destination: 'Punta Cana',
      startsAt,
      endsAt,
      ownerId: owner.id.toString(),
      emailsToInvite: ['test@planner.com', 'test2@planner.com'],
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.trip).toHaveProperty('id')
    expect(travelersRepository.items.length).toBe(1)
    expect(participantsRepository.items.length).toBe(3)
    expect(mailer.sentMails.length).toBe(2)
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
})

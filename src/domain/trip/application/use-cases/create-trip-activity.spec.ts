import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { CreateTripActivityUseCase } from './create-trip-activity'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { dayjs } from '@/lib/dayjs'
import { InvalidDate } from './errors/invalid-date-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'

let travelersRepository: FakeTravelersRepository
let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let linksRepository: FakeLinksRepository
let createTripActivityUseCase: CreateTripActivityUseCase

describe('Create Trip Activity', () => {
  beforeEach(() => {
    travelersRepository = new FakeTravelersRepository()
    activitiesRepository = new FakeActivitiesRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    createTripActivityUseCase = new CreateTripActivityUseCase(
      activitiesRepository,
      tripsRepository,
    )
  })

  it('should be able to create a activity in a trip', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await createTripActivityUseCase.execute({
      title: 'Hotel Check-in',
      occursAt: dayjs().add(1, 'month').add(1, 'hour').toDate(),
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.activity).toHaveProperty('id')
  })

  it('should not be able to create a activity in a trip if date is less than startsAt trip', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await createTripActivityUseCase.execute({
      title: 'Hotel Check-in',
      occursAt: dayjs().add(1, 'month').subtract(1, 'day').toDate(),
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidDate)
  })

  it('should not be able to create a activity in a trip if date is bigger than endsAt trip', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await createTripActivityUseCase.execute({
      title: 'Hotel Check-out',
      occursAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      tripId: trip.id.toString(),
      travelerId: owner.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidDate)
  })

  it('should not be able to create a activity in a trip if trip does not exists', async () => {
    const result = await createTripActivityUseCase.execute({
      title: 'Hotel Check-out',
      occursAt: dayjs().toDate(),
      tripId: new UniqueEntityID().toString(),
      travelerId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })

  it('should not be able to create a activity if the traveler is not the trip owner', async () => {
    const owner = await makeTraveler()
    const intruder = await makeTraveler()

    travelersRepository.items.push(owner, intruder)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await createTripActivityUseCase.execute({
      title: 'Hotel Check-in',
      occursAt: dayjs().add(1, 'month').add(1, 'hour').toDate(),
      tripId: trip.id.toString(),
      travelerId: intruder.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(activitiesRepository.items).toHaveLength(0)
  })

  describe('within whole UTC trip days', () => {
    async function makeOwnerTrip() {
      const owner = await makeTraveler()

      travelersRepository.items.push(owner)

      const trip = await makeTrip({
        startsAt: new Date('2026-03-10T00:00:00.000Z'),
        endsAt: new Date('2026-03-14T00:00:00.000Z'),
        ownerId: owner.id,
      })

      tripsRepository.items.push(trip)

      return { owner, trip }
    }

    it('should be able to create an activity in the afternoon of the last trip day', async () => {
      const { owner, trip } = await makeOwnerTrip()

      const result = await createTripActivityUseCase.execute({
        title: 'Farewell dinner',
        occursAt: new Date('2026-03-14T14:00:00.000Z'),
        tripId: trip.id.toString(),
        travelerId: owner.id.toString(),
      })

      expect(result.isRight()).toBeTruthy()
      expect(activitiesRepository.items).toHaveLength(1)
    })

    it('should be able to create an activity at midnight of the first trip day', async () => {
      const { owner, trip } = await makeOwnerTrip()

      const result = await createTripActivityUseCase.execute({
        title: 'Arrival',
        occursAt: new Date('2026-03-10T00:00:00.000Z'),
        tripId: trip.id.toString(),
        travelerId: owner.id.toString(),
      })

      expect(result.isRight()).toBeTruthy()
    })

    it('should not be able to create an activity on the day after the trip ends', async () => {
      const { owner, trip } = await makeOwnerTrip()

      const result = await createTripActivityUseCase.execute({
        title: 'Too late',
        occursAt: new Date('2026-03-15T00:00:00.000Z'),
        tripId: trip.id.toString(),
        travelerId: owner.id.toString(),
      })

      expect(result.value).toBeInstanceOf(InvalidDate)
      expect(activitiesRepository.items).toHaveLength(0)
    })
  })
})

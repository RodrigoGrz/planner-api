import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { CreateTripActivityUseCase } from './create-trip-activity'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import dayjs from 'dayjs'
import { InvalidDate } from './errors/invalid-date-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'

let travelersRepository: FakeTravelersRepository
let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let createTripActivityUseCase: CreateTripActivityUseCase

describe('Create Trip Activity', () => {
  beforeEach(() => {
    travelersRepository = new FakeTravelersRepository()
    activitiesRepository = new FakeActivitiesRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
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
      occursAt: dayjs().add(1, 'month').subtract(1, 'hour').toDate(),
      tripId: trip.id.toString(),
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
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidDate)
  })

  it('should not be able to create a activity in a trip if trip does not exists', async () => {
    const result = await createTripActivityUseCase.execute({
      title: 'Hotel Check-out',
      occursAt: dayjs().toDate(),
      tripId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })
})

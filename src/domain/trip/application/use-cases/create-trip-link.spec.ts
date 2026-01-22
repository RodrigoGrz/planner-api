import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { CreateTripLinkUseCase } from './create-trip-link'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTrip } from 'tests/factories/make-trip'
import { makeTraveler } from 'tests/factories/make-traveler'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'

let activitiesRepository: FakeActivitiesRepository
let linksRepository: FakeLinksRepository
let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let createTripLinkUseCase: CreateTripLinkUseCase

describe('Create Trip Link', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
    )
    createTripLinkUseCase = new CreateTripLinkUseCase(
      linksRepository,
      tripsRepository,
    )
  })

  it('should be able to create a trip link', async () => {
    const traveler = await makeTraveler()

    travelersRepository.items.push(traveler)

    const trip = await makeTrip({
      ownerId: traveler.id,
    })

    tripsRepository.items.push(trip)

    const result = await createTripLinkUseCase.execute({
      title: 'test',
      url: 'https://google.com',
      tripId: trip.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.link).toHaveProperty('id')
  })

  it('should be not able to create a trip link if trip does not exists', async () => {
    const result = await createTripLinkUseCase.execute({
      title: 'wrong',
      url: 'https://google.com',
      tripId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })
})

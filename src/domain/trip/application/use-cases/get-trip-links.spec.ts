import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'
import { GetTripLinksUseCase } from './get-trip-links'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { makeTrip } from 'tests/factories/make-trip'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeLink } from 'tests/factories/make-link'
import { makeParticipant } from 'tests/factories/make-participant'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'

let activitiesRepository: FakeActivitiesRepository
let linksRepository: FakeLinksRepository
let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let participantsRepository: FakeParticipantsRepository
let getTripLinksUseCase: GetTripLinksUseCase

describe('Get Trip Links', () => {
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
    getTripLinksUseCase = new GetTripLinksUseCase(
      linksRepository,
      tripsRepository,
      participantsRepository,
    )
  })

  it('should be able to get all links by trip id', async () => {
    const owner1 = await makeTraveler()
    const owner2 = await makeTraveler()

    travelersRepository.items.push(owner1)
    travelersRepository.items.push(owner2)

    const trip1 = await makeTrip({
      ownerId: owner1.id,
    })
    const trip2 = await makeTrip({
      ownerId: owner2.id,
    })

    tripsRepository.items.push(trip1)
    tripsRepository.items.push(trip2)

    const link1 = await makeLink({
      tripId: trip1.id,
    })

    const link2 = await makeLink({
      tripId: trip1.id,
    })

    const link3 = await makeLink({
      tripId: trip2.id,
    })

    linksRepository.items.push(link1)
    linksRepository.items.push(link2)
    linksRepository.items.push(link3)

    const result = await getTripLinksUseCase.execute({
      tripId: trip1.id.toString(),
      travelerId: owner1.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.links).length(2)
    expect(linksRepository.items.length).toBe(3)
  })

  it('should be able to get trip links as a linked participant', async () => {
    const owner = await makeTraveler()
    const guest = await makeTraveler()

    travelersRepository.items.push(owner, guest)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const link = await makeLink({
      tripId: trip.id,
    })

    linksRepository.items.push(link)

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: guest.id,
    })

    participantsRepository.items.push(participant)

    const result = await getTripLinksUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: guest.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.links).length(1)
  })

  it('should not be able to get links of someone else trip', async () => {
    const owner = await makeTraveler()
    const intruder = await makeTraveler()

    travelersRepository.items.push(owner, intruder)

    const trip = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await getTripLinksUseCase.execute({
      tripId: trip.id.toString(),
      travelerId: intruder.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to get links of a trip that does not exist', async () => {
    const result = await getTripLinksUseCase.execute({
      tripId: new UniqueEntityID().toString(),
      travelerId: new UniqueEntityID().toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotExistsError)
  })
})

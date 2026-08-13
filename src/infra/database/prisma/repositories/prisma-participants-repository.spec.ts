import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeParticipant } from 'tests/factories/make-participant'
import { makePrismaTraveler } from 'tests/factories/make-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'
import { PrismaParticipantsRepository } from './prisma-participants-repository'

let repository: PrismaParticipantsRepository

describe('PrismaParticipantsRepository (integration)', () => {
  beforeAll(() => {
    repository = new PrismaParticipantsRepository()
  })

  it('should round-trip a participant through create and findByConfirmationToken', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makePrismaTrip({ ownerId: owner.id })

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: owner.id,
      isConfirmed: false,
      confirmationToken: 'token-round-trip',
    })

    await repository.create(participant)

    const found = await repository.findByConfirmationToken('token-round-trip')

    expect(found).not.toBeNull()
    expect(found?.id.toString()).toBe(participant.id.toString())
    expect(found?.name).toBe(participant.name)
    expect(found?.email).toBe(participant.email)
    expect(found?.isConfirmed).toBe(false)
    expect(found?.confirmationToken).toBe('token-round-trip')
    expect(found?.tripId.toString()).toBe(trip.id.toString())
    expect(found?.travelerId?.toString()).toBe(owner.id.toString())
  })

  it('should clear the confirmation token when a participant is confirmed', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makePrismaTrip({ ownerId: owner.id })

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: null,
      isConfirmed: false,
      confirmationToken: 'token-to-be-cleared',
    })

    await repository.create(participant)

    participant.confirm()

    await repository.update(participant)

    const reused = await repository.findByConfirmationToken(
      'token-to-be-cleared',
    )

    expect(reused).toBeNull()

    const [stored] = await repository.findAllByTripId(trip.id.toString())

    expect(stored.isConfirmed).toBe(true)
    expect(stored.confirmationToken).toBeNull()
  })

  it('should find a participant by trip and traveler', async () => {
    const owner = await makePrismaTraveler()
    const guest = await makePrismaTraveler()
    const trip = await makePrismaTrip({ ownerId: owner.id })

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: guest.id,
    })

    await repository.create(participant)

    const found = await repository.findByTripAndTravelerId(
      trip.id.toString(),
      guest.id.toString(),
    )

    expect(found?.id.toString()).toBe(participant.id.toString())
  })

  it('should not find a participant of another trip', async () => {
    const owner = await makePrismaTraveler()
    const guest = await makePrismaTraveler()
    const trip = await makePrismaTrip({ ownerId: owner.id })
    const otherTrip = await makePrismaTrip({ ownerId: owner.id })

    await repository.create(
      await makeParticipant({
        tripId: trip.id,
        travelerId: guest.id,
      }),
    )

    const found = await repository.findByTripAndTravelerId(
      otherTrip.id.toString(),
      guest.id.toString(),
    )

    expect(found).toBeNull()
  })

  it('should not find a participant that has no traveler linked', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makePrismaTrip({ ownerId: owner.id })

    await repository.create(
      await makeParticipant({
        tripId: trip.id,
        travelerId: null,
      }),
    )

    const found = await repository.findByTripAndTravelerId(
      trip.id.toString(),
      new UniqueEntityID().toString(),
    )

    expect(found).toBeNull()
  })
})

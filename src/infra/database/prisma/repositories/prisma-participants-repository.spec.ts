import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { dayjs } from '@/lib/dayjs'
import { makeParticipant } from 'tests/factories/make-participant'
import { makePrismaTraveler } from 'tests/factories/make-traveler'
import { makePrismaTrip } from 'tests/factories/make-trip'
import { PrismaParticipantsRepository } from './prisma-participants-repository'

let repository: PrismaParticipantsRepository

describe('PrismaParticipantsRepository (integration)', () => {
  beforeAll(() => {
    repository = new PrismaParticipantsRepository()
  })

  it('should return a trip that starts today as the next trip', async () => {
    const owner = await makePrismaTraveler()
    const today = dayjs.utc().startOf('day')

    const trip = await makePrismaTrip({
      ownerId: owner.id,
      startsAt: today.toDate(),
      endsAt: today.add(3, 'day').toDate(),
    })

    await repository.create(
      await makeParticipant({
        tripId: trip.id,
        travelerId: owner.id,
        isConfirmed: true,
      }),
    )

    const nextTrip = await repository.findNextTripByTravelerId(
      owner.id.toString(),
    )

    expect(nextTrip?.tripId.toString()).toBe(trip.id.toString())
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

  it('should find only unlinked participants with the given e-mail', async () => {
    const owner = await makePrismaTraveler()
    const firstTrip = await makePrismaTrip({ ownerId: owner.id })
    const secondTrip = await makePrismaTrip({ ownerId: owner.id })

    const unlinked = await makeParticipant({
      tripId: firstTrip.id,
      email: 'pending@planner.com',
      travelerId: null,
    })
    const linked = await makeParticipant({
      tripId: secondTrip.id,
      email: 'pending@planner.com',
      travelerId: owner.id,
    })
    const otherEmail = await makeParticipant({
      tripId: firstTrip.id,
      email: 'other@planner.com',
      travelerId: null,
    })

    await repository.create(unlinked)
    await repository.create(linked)
    await repository.create(otherEmail)

    const found = await repository.findManyUnlinkedByEmail(
      'pending@planner.com',
    )

    expect(found.map((participant) => participant.id.toString())).toEqual([
      unlinked.id.toString(),
    ])
  })

  it('should persist the linked traveler on update', async () => {
    const owner = await makePrismaTraveler()
    const guest = await makePrismaTraveler()
    const trip = await makePrismaTrip({ ownerId: owner.id })

    const participant = await makeParticipant({
      tripId: trip.id,
      email: guest.email,
      name: null,
      travelerId: null,
    })

    await repository.create(participant)

    participant.linkTraveler(guest.id, guest.name)

    await repository.update(participant)

    const stored = await repository.findByTripAndTravelerId(
      trip.id.toString(),
      guest.id.toString(),
    )

    expect(stored?.id.toString()).toBe(participant.id.toString())
    expect(stored?.name).toBe(guest.name)
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

  it('should find a participant by trip and e-mail only within that trip', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makePrismaTrip({ ownerId: owner.id })
    const otherTrip = await makePrismaTrip({ ownerId: owner.id })

    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: null,
      email: 'invited@planner.com',
    })

    await repository.create(participant)

    const found = await repository.findByTripIdAndEmail(
      trip.id.toString(),
      'invited@planner.com',
    )

    const notFound = await repository.findByTripIdAndEmail(
      otherTrip.id.toString(),
      'invited@planner.com',
    )

    expect(found?.id.toString()).toBe(participant.id.toString())
    expect(notFound).toBeNull()
  })
})

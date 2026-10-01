import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { dayjs } from '@/lib/dayjs'
import { makeActivity } from 'tests/factories/make-activity'
import { makeLink } from 'tests/factories/make-link'
import { makePrismaTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { PrismaTripsRepository } from './prisma-trips-repository'
import { PrismaActivitiesRepository } from './prisma-activities-repository'
import { PrismaLinksRepository } from './prisma-links-repository'
import { PrismaParticipantsRepository } from './prisma-participants-repository'
import { makeParticipant } from 'tests/factories/make-participant'

let tripsRepository: PrismaTripsRepository
let activitiesRepository: PrismaActivitiesRepository
let linksRepository: PrismaLinksRepository
let participantsRepository: PrismaParticipantsRepository

describe('Prisma repositories (integration)', () => {
  beforeAll(() => {
    tripsRepository = new PrismaTripsRepository()
    activitiesRepository = new PrismaActivitiesRepository()
    linksRepository = new PrismaLinksRepository()
    participantsRepository = new PrismaParticipantsRepository()
  })

  it('should round-trip a trip through create and findById', async () => {
    const owner = await makePrismaTraveler()

    const trip = await makeTrip({
      destination: 'Noruega',
      ownerId: owner.id,
      startsAt: dayjs().add(1, 'month').startOf('minute').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').startOf('minute').toDate(),
    })

    await tripsRepository.create(trip)

    const found = await tripsRepository.findById(trip.id.toString())

    expect(found).not.toBeNull()
    expect(found?.destination).toBe('Noruega')
    expect(found?.ownerId.toString()).toBe(owner.id.toString())
    expect(found?.startsAt).toEqual(trip.startsAt)
    expect(found?.endsAt).toEqual(trip.endsAt)
    expect(found?.coverImageUrl).toBeNull()
  })

  it('should expose the owner id and name through findByIdWithOwner', async () => {
    const owner = await makePrismaTraveler({ name: 'Dona da viagem' })

    const trip = await makeTrip({ ownerId: owner.id })

    await tripsRepository.create(trip)

    const found = await tripsRepository.findByIdWithOwner(trip.id.toString())

    expect(found?.ownerId.toString()).toBe(owner.id.toString())
    expect(found?.ownerName).toBe('Dona da viagem')
  })

  it('should return null for a trip that does not exist', async () => {
    const found = await tripsRepository.findById(
      new UniqueEntityID().toString(),
    )

    expect(found).toBeNull()
  })

  it('should round-trip an activity through create and findById', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })

    await tripsRepository.create(trip)

    const activity = await makeActivity({
      title: 'Hotel Check-in',
      tripId: trip.id,
      occursAt: dayjs().add(1, 'month').startOf('minute').toDate(),
    })

    await activitiesRepository.create(activity)

    const found = await activitiesRepository.findById(activity.id.toString())

    expect(found?.title).toBe('Hotel Check-in')
    expect(found?.tripId.toString()).toBe(trip.id.toString())
    expect(found?.occursAt).toEqual(activity.occursAt)
  })

  it('should round-trip a link through create and findAllByTripId', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })

    await tripsRepository.create(trip)

    const link = await makeLink({
      title: 'Google',
      url: 'https://google.com',
      tripId: trip.id,
    })

    await linksRepository.create(link)

    const [found] = await linksRepository.findAllByTripId(trip.id.toString())

    expect(found.id.toString()).toBe(link.id.toString())
    expect(found.title).toBe('Google')
    expect(found.url).toBe('https://google.com')
    expect(found.tripId.toString()).toBe(trip.id.toString())
  })

  it('should rollback every write when the transaction callback throws', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })
    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: owner.id,
    })

    await expect(
      tripsRepository.runInTransaction(async () => {
        await tripsRepository.create(trip)
        await participantsRepository.create(participant)

        throw new Error('transaction failed')
      }),
    ).rejects.toThrow('transaction failed')

    expect(await tripsRepository.findById(trip.id.toString())).toBeNull()
    expect(
      await participantsRepository.findAllByTripId(trip.id.toString()),
    ).toHaveLength(0)
  })

  it('should commit every write when the transaction callback resolves', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })
    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: owner.id,
    })

    await tripsRepository.runInTransaction(async () => {
      await tripsRepository.create(trip)
      await participantsRepository.create(participant)
    })

    expect(await tripsRepository.findById(trip.id.toString())).not.toBeNull()
    expect(
      await participantsRepository.findAllByTripId(trip.id.toString()),
    ).toHaveLength(1)
  })

  it('should reuse the current transaction when runInTransaction is nested', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })
    const participant = await makeParticipant({
      tripId: trip.id,
      travelerId: owner.id,
    })

    await expect(
      tripsRepository.runInTransaction(async () => {
        await tripsRepository.create(trip)

        await tripsRepository.runInTransaction(async () => {
          await participantsRepository.create(participant)
        })

        throw new Error('outer transaction failed')
      }),
    ).rejects.toThrow('outer transaction failed')

    expect(await tripsRepository.findById(trip.id.toString())).toBeNull()
    expect(
      await participantsRepository.findAllByTripId(trip.id.toString()),
    ).toHaveLength(0)
  })

  it('should read its own uncommitted writes inside the transaction', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })

    const found = await tripsRepository.runInTransaction(async () => {
      await tripsRepository.create(trip)

      return tripsRepository.findById(trip.id.toString())
    })

    expect(found?.id.toString()).toBe(trip.id.toString())
  })
})

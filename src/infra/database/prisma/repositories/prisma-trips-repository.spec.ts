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

  it('should keep createdAt when updating a trip', async () => {
    const owner = await makePrismaTraveler()
    const createdAt = dayjs().subtract(1, 'year').startOf('second').toDate()

    const trip = await makeTrip({ ownerId: owner.id, createdAt })

    await tripsRepository.create(trip)

    const stored = await tripsRepository.findById(trip.id.toString())

    if (!stored) {
      throw new Error('Trip was not persisted')
    }

    stored.destination = 'Londres'

    await tripsRepository.updateDetails(stored, stored.version)

    const updated = await tripsRepository.findById(trip.id.toString())

    expect(updated?.destination).toBe('Londres')
    expect(updated?.createdAt).toEqual(createdAt)
  })

  it('should not overwrite the cover image when updating trip details', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id, destination: 'Paris' })

    await tripsRepository.create(trip)

    const staleTrip = await tripsRepository.findById(trip.id.toString())
    const coverTrip = await tripsRepository.findById(trip.id.toString())

    if (!staleTrip || !coverTrip) {
      throw new Error('Trip was not persisted')
    }

    coverTrip.coverImageUrl = 'new-cover.png'
    await tripsRepository.updateCoverImage(coverTrip, null)

    staleTrip.destination = 'Londres'
    await tripsRepository.updateDetails(staleTrip, staleTrip.version)

    const updated = await tripsRepository.findById(trip.id.toString())

    expect(updated?.destination).toBe('Londres')
    expect(updated?.coverImageUrl).toBe('new-cover.png')
  })

  it('should not overwrite trip details when updating the cover image', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id, destination: 'Paris' })

    await tripsRepository.create(trip)

    const staleTrip = await tripsRepository.findById(trip.id.toString())
    const detailsTrip = await tripsRepository.findById(trip.id.toString())

    if (!staleTrip || !detailsTrip) {
      throw new Error('Trip was not persisted')
    }

    detailsTrip.destination = 'Londres'
    await tripsRepository.updateDetails(detailsTrip, detailsTrip.version)

    staleTrip.coverImageUrl = 'new-cover.png'
    await tripsRepository.updateCoverImage(staleTrip, null)

    const updated = await tripsRepository.findById(trip.id.toString())

    expect(updated?.destination).toBe('Londres')
    expect(updated?.coverImageUrl).toBe('new-cover.png')
  })

  it('should increment the version when updating trip details', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })

    await tripsRepository.create(trip)

    const stored = await tripsRepository.findById(trip.id.toString())

    if (!stored) {
      throw new Error('Trip was not persisted')
    }

    stored.destination = 'Londres'
    const updated = await tripsRepository.updateDetails(stored, 1)

    const found = await tripsRepository.findById(trip.id.toString())

    expect(updated).toBe(true)
    expect(found?.version).toBe(2)
  })

  it('should not update trip details when the expected version is stale', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id, destination: 'Paris' })

    await tripsRepository.create(trip)

    const firstEditor = await tripsRepository.findById(trip.id.toString())
    const secondEditor = await tripsRepository.findById(trip.id.toString())

    if (!firstEditor || !secondEditor) {
      throw new Error('Trip was not persisted')
    }

    firstEditor.destination = 'Londres'
    await tripsRepository.updateDetails(firstEditor, firstEditor.version)

    secondEditor.destination = 'Roma'
    const updated = await tripsRepository.updateDetails(
      secondEditor,
      secondEditor.version,
    )

    const found = await tripsRepository.findById(trip.id.toString())

    expect(updated).toBe(false)
    expect(found?.destination).toBe('Londres')
    expect(found?.version).toBe(2)
  })

  it('should not change the version when updating the cover image', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })

    await tripsRepository.create(trip)

    const stored = await tripsRepository.findById(trip.id.toString())

    if (!stored) {
      throw new Error('Trip was not persisted')
    }

    stored.coverImageUrl = 'new-cover.png'
    await tripsRepository.updateCoverImage(stored, null)

    const found = await tripsRepository.findById(trip.id.toString())

    expect(found?.coverImageUrl).toBe('new-cover.png')
    expect(found?.version).toBe(1)
  })

  it('should update the cover image when the previous key matches, including null', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })

    await tripsRepository.create(trip)

    const stored = await tripsRepository.findById(trip.id.toString())

    if (!stored) {
      throw new Error('Trip was not persisted')
    }

    stored.coverImageUrl = 'first-cover.png'
    const firstUpdate = await tripsRepository.updateCoverImage(stored, null)

    stored.coverImageUrl = 'second-cover.png'
    const secondUpdate = await tripsRepository.updateCoverImage(
      stored,
      'first-cover.png',
    )

    const found = await tripsRepository.findById(trip.id.toString())

    expect(firstUpdate).toBe(true)
    expect(secondUpdate).toBe(true)
    expect(found?.coverImageUrl).toBe('second-cover.png')
  })

  it('should not update the cover image when the previous key does not match', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({
      ownerId: owner.id,
      coverImageUrl: 'current-cover.png',
    })

    await tripsRepository.create(trip)

    const stored = await tripsRepository.findById(trip.id.toString())

    if (!stored) {
      throw new Error('Trip was not persisted')
    }

    stored.coverImageUrl = 'new-cover.png'
    const updated = await tripsRepository.updateCoverImage(
      stored,
      'another-cover.png',
    )

    const found = await tripsRepository.findById(trip.id.toString())

    expect(updated).toBe(false)
    expect(found?.coverImageUrl).toBe('current-cover.png')
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

  it('should return activities with their persisted ids in findByIdWithActivities', async () => {
    const owner = await makePrismaTraveler()
    const trip = await makeTrip({ ownerId: owner.id })

    await tripsRepository.create(trip)

    const firstActivity = await makeActivity({ tripId: trip.id })
    const secondActivity = await makeActivity({ tripId: trip.id })

    await activitiesRepository.create(firstActivity)
    await activitiesRepository.create(secondActivity)

    const found = await tripsRepository.findByIdWithActivities(
      trip.id.toString(),
    )

    const foundIds = found?.activities.map((activity) => activity.id.toString())

    expect(foundIds).toHaveLength(2)
    expect(foundIds).toEqual(
      expect.arrayContaining([
        firstActivity.id.toString(),
        secondActivity.id.toString(),
      ]),
    )
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

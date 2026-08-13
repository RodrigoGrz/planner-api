import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { dayjs } from '@/lib/dayjs'
import { makeActivity } from 'tests/factories/make-activity'
import { makeLink } from 'tests/factories/make-link'
import { makePrismaTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { PrismaTripsRepository } from './prisma-trips-repository'
import { PrismaActivitiesRepository } from './prisma-activities-repository'
import { PrismaLinksRepository } from './prisma-links-repository'

let tripsRepository: PrismaTripsRepository
let activitiesRepository: PrismaActivitiesRepository
let linksRepository: PrismaLinksRepository

describe('Prisma repositories (integration)', () => {
  beforeAll(() => {
    tripsRepository = new PrismaTripsRepository()
    activitiesRepository = new PrismaActivitiesRepository()
    linksRepository = new PrismaLinksRepository()
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
})

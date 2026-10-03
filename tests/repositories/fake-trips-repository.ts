import { TripsRepository } from '@/domain/trip/application/repositories/trips-repository'
import { Trip } from '@/domain/trip/enterprise/entities/trip'
import {
  TripWithOwner,
  TripWithOwnerProps,
} from '@/domain/trip/enterprise/entities/value-objects/trip-with-owner'
import { FakeTravelersRepository } from './fake-travelers-repository'
import {
  TripWithActivities,
  TripWithActivitiesProps,
} from '@/domain/trip/enterprise/entities/value-objects/trip-with-activities'
import { FakeActivitiesRepository } from './fake-activities-repository'
import { FakeLinksRepository } from './fake-links-repository'

export class FakeTripsRepository implements TripsRepository {
  public items: Trip[] = []
  private versions = new Map<string, number>()
  private coverKeys = new Map<string, string | null>()

  constructor(
    private fakeTravelersRepository: FakeTravelersRepository,
    private fakeActivitiesRepository: FakeActivitiesRepository,
    private fakeLinksRepository: FakeLinksRepository,
  ) {}

  private registerPersistedState(trip: Trip) {
    const id = trip.id.toString()

    if (!this.versions.has(id)) {
      this.versions.set(id, trip.version)
    }

    if (!this.coverKeys.has(id)) {
      this.coverKeys.set(id, trip.coverImageUrl ?? null)
    }
  }

  async create(trip: Trip): Promise<void> {
    this.items.push(trip)
    this.registerPersistedState(trip)
  }

  async findById(id: string): Promise<Trip | null> {
    const trip = this.items.find((item) => item.id.toString() === id)

    if (!trip) {
      return null
    }

    this.registerPersistedState(trip)

    return trip
  }

  async findByIdWithOwner(id: string): Promise<TripWithOwnerProps | null> {
    const trip = this.items.find((item) => item.id.toString() === id)

    if (!trip) {
      return null
    }

    const owner = await this.fakeTravelersRepository.findById(
      trip.ownerId.toString(),
    )

    if (!owner) {
      return null
    }

    return TripWithOwner.create({
      tripId: trip.id,
      destination: trip.destination,
      startsAt: trip.startsAt,
      endsAt: trip.endsAt,
      ownerId: trip.ownerId,
      ownerName: owner.name,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      version: this.versions.get(id) ?? trip.version,
    })
  }

  async findByIdWithActivities(
    id: string,
  ): Promise<TripWithActivitiesProps | null> {
    const trip = this.items.find((item) => item.id.toString() === id)

    if (!trip) {
      return null
    }

    const activities = this.fakeActivitiesRepository.items.filter(
      (item) => item.tripId.toString() === trip.id.toString(),
    )

    return TripWithActivities.create({
      tripId: trip.id,
      destination: trip.destination,
      startsAt: trip.startsAt,
      endsAt: trip.endsAt,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      activities,
    })
  }

  async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn()
  }

  async updateDetails(trip: Trip, expectedVersion: number): Promise<boolean> {
    const id = trip.id.toString()

    this.registerPersistedState(trip)

    const currentVersion = this.versions.get(id)

    if (currentVersion !== expectedVersion) {
      return false
    }

    this.versions.set(id, expectedVersion + 1)

    return true
  }

  async updateCoverImage(
    trip: Trip,
    previousKey: string | null,
  ): Promise<boolean> {
    const id = trip.id.toString()

    if (this.coverKeys.get(id) !== previousKey) {
      return false
    }

    this.coverKeys.set(id, trip.coverImageUrl ?? null)

    return true
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id)

    this.fakeActivitiesRepository.items =
      this.fakeActivitiesRepository.items.filter(
        (item) => item.tripId.toString() !== id,
      )

    this.fakeLinksRepository.items = this.fakeLinksRepository.items.filter(
      (item) => item.tripId.toString() !== id,
    )
  }
}

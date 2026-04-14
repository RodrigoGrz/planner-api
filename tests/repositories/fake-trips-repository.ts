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

  constructor(
    private fakeTravelersRepository: FakeTravelersRepository,
    private fakeActivitiesRepository: FakeActivitiesRepository,
    private fakeLinksRepository: FakeLinksRepository,
  ) {}

  async create(trip: Trip): Promise<void> {
    this.items.push(trip)
  }

  async findById(id: string): Promise<Trip | null> {
    const trip = this.items.find((item) => item.id.toString() === id)

    if (!trip) {
      return null
    }

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
      ownerName: owner.name,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
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

  async update(data: Trip): Promise<void> {
    const trip = this.items.find(
      (item) => item.id.toString() === data.id.toString(),
    )

    if (trip) {
      trip.destination = data.destination
      trip.startsAt = data.startsAt
      trip.endsAt = data.endsAt
    }
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

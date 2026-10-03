import { TripsRepository } from '@/domain/trip/application/repositories/trips-repository'
import { Trip } from '@/domain/trip/enterprise/entities/trip'
import { getPrismaClient, runInPrismaTransaction } from '../transaction-context'
import { PrismaTripMapper } from '../mappers/prisma-trip-mapper'
import {
  TripWithOwner,
  TripWithOwnerProps,
} from '@/domain/trip/enterprise/entities/value-objects/trip-with-owner'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  TripWithActivities,
  TripWithActivitiesProps,
} from '@/domain/trip/enterprise/entities/value-objects/trip-with-activities'
import { PrismaActivityMapper } from '../mappers/prisma-activity-mapper'

export class PrismaTripsRepository implements TripsRepository {
  async create(trip: Trip): Promise<void> {
    await getPrismaClient().trip.create({
      data: PrismaTripMapper.toPrisma(trip),
    })
  }

  async findById(id: string): Promise<Trip | null> {
    const trip = await getPrismaClient().trip.findUnique({
      where: {
        id,
      },
    })

    if (!trip) {
      return null
    }

    return PrismaTripMapper.toDomain(trip)
  }

  async findByIdWithOwner(id: string): Promise<TripWithOwnerProps | null> {
    const trip = await getPrismaClient().trip.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
      },
    })

    if (!trip) {
      return null
    }

    return TripWithOwner.create({
      tripId: new UniqueEntityID(trip.id),
      destination: trip.destination,
      startsAt: trip.starts_at,
      endsAt: trip.ends_at,
      ownerId: new UniqueEntityID(trip.owner_id),
      ownerName: trip.owner.name,
      createdAt: trip.created_at,
      updatedAt: trip.updated_at,
      version: trip.version,
    })
  }

  async findByIdWithActivities(
    id: string,
  ): Promise<TripWithActivitiesProps | null> {
    const trip = await getPrismaClient().trip.findUnique({
      where: {
        id,
      },
      include: {
        activities: true,
      },
    })

    if (!trip) {
      return null
    }

    return TripWithActivities.create({
      tripId: new UniqueEntityID(trip.id),
      destination: trip.destination,
      startsAt: trip.starts_at,
      endsAt: trip.ends_at,
      createdAt: trip.created_at,
      updatedAt: trip.updated_at,
      activities: trip.activities.map(PrismaActivityMapper.toDomain),
    })
  }

  async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return runInPrismaTransaction(fn)
  }

  async updateDetails(trip: Trip, expectedVersion: number): Promise<boolean> {
    const { count } = await getPrismaClient().trip.updateMany({
      where: {
        id: trip.id.toString(),
        version: expectedVersion,
      },
      data: {
        destination: trip.destination,
        starts_at: trip.startsAt,
        ends_at: trip.endsAt,
        updated_at: trip.updatedAt,
        version: { increment: 1 },
      },
    })

    return count === 1
  }

  async updateCoverImage(
    trip: Trip,
    previousKey: string | null,
  ): Promise<boolean> {
    const { count } = await getPrismaClient().trip.updateMany({
      where: {
        id: trip.id.toString(),
        cover_image_url: previousKey,
      },
      data: {
        cover_image_url: trip.coverImageUrl,
        updated_at: trip.updatedAt,
      },
    })

    return count === 1
  }

  async delete(id: string): Promise<void> {
    await getPrismaClient().trip.delete({
      where: {
        id,
      },
    })
  }
}

import { TripsRepository } from '@/domain/trip/application/repositories/trips-repository'
import { Trip } from '@/domain/trip/enterprise/entities/trip'
import { prisma } from '../prisma'
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
import { Activity } from '@/domain/trip/enterprise/entities/activity'

export class PrismaTripsRepository implements TripsRepository {
  async create(trip: Trip): Promise<void> {
    await prisma.trip.create({
      data: PrismaTripMapper.toPrisma(trip),
    })
  }

  async findById(id: string): Promise<Trip | null> {
    const trip = await prisma.trip.findUnique({
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
    const trip = await prisma.trip.findUnique({
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
      ownerName: trip.owner.name,
      createdAt: trip.created_at,
      updatedAt: trip.updated_at,
    })
  }

  async findByIdWithActivities(
    id: string,
  ): Promise<TripWithActivitiesProps | null> {
    const trip = await prisma.trip.findUnique({
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
      activities: trip.activities.map((item) =>
        Activity.create({
          title: item.title,
          occursAt: item.occurs_at,
          tripId: new UniqueEntityID(item.trip_id),
        }),
      ),
    })
  }

  async update(trip: Trip): Promise<void> {
    await prisma.trip.update({
      where: {
        id: trip.id.toString(),
      },
      data: PrismaTripMapper.toPrisma(trip),
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.trip.delete({
      where: {
        id,
      },
    })
  }
}

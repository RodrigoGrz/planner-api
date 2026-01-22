import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Trip } from '@/domain/trip/enterprise/entities/trip'
import { Trip as PrismaTrip, Prisma } from '@prisma/client'

export class PrismaTripMapper {
  static toDomain(raw: PrismaTrip): Trip {
    return Trip.create(
      {
        destination: raw.destination,
        startsAt: raw.starts_at,
        endsAt: raw.ends_at,
        ownerId: new UniqueEntityID(raw.owner_id),
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(trip: Trip): Prisma.TripUncheckedCreateInput {
    return {
      id: trip.id.toString(),
      destination: trip.destination,
      starts_at: trip.startsAt,
      ends_at: trip.endsAt,
      owner_id: trip.ownerId.toString(),
      created_at: trip.createdAt,
      updated_at: trip.updatedAt,
    }
  }
}

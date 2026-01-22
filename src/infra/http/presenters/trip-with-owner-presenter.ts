import { TripWithOwnerProps } from '@/domain/trip/enterprise/entities/value-objects/trip-with-owner'

export class TripWithOwnerPresenter {
  static toHTTP(trip: TripWithOwnerProps) {
    return {
      id: trip.tripId.toString(),
      destination: trip.destination,
      startsAt: trip.startsAt,
      endsAt: trip.endsAt,
      ownerName: trip.ownerName,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    }
  }
}

import { Trip } from '@/domain/trip/enterprise/entities/trip'

export class TripPresenter {
  static toHTTP(trip: Trip) {
    return {
      id: trip.id.toString(),
      destination: trip.destination,
      startsAt: trip.startsAt,
      endsAt: trip.endsAt,
    }
  }
}

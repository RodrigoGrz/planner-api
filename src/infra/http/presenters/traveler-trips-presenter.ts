import { ParticipantWithTripProps } from '@/domain/trip/enterprise/entities/value-objects/participant-with-trip'

export class TravelerTripsPresenter {
  static toHTTP(participant: ParticipantWithTripProps) {
    return {
      participantId: participant.participantId.toString(),
      tripId: participant.tripId.toString(),
      name: participant.name,
      email: participant.email,
      isConfirmed: participant.isConfirmed,
      destination: participant.destination,
      startsAt: participant.startsAt,
      endsAt: participant.endsAt,
    }
  }
}

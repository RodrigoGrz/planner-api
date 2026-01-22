import { Participant } from '../../enterprise/entities/participant'
import { ParticipantWithTripProps } from '../../enterprise/entities/value-objects/participant-with-trip'

export interface ParticipantsRepository {
  create(participant: Participant): Promise<void>
  findAllByTripId(tripId: string): Promise<Participant[]>
  findAllByTravelerId(travelerId: string): Promise<ParticipantWithTripProps[]>
  findNextTripByTravelerId(
    travelerId: string,
  ): Promise<ParticipantWithTripProps | null>
}

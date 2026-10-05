import { Participant } from '../../enterprise/entities/participant'
import { ParticipantWithTripProps } from '../../enterprise/entities/value-objects/participant-with-trip'

export interface ParticipantsRepository {
  create(participant: Participant): Promise<void>
  update(participant: Participant): Promise<void>
  delete(id: string): Promise<void>
  findById(id: string): Promise<Participant | null>
  findByConfirmationToken(token: string): Promise<Participant | null>
  findByTripAndTravelerId(
    tripId: string,
    travelerId: string,
  ): Promise<Participant | null>
  findByTripIdAndEmail(
    tripId: string,
    email: string,
  ): Promise<Participant | null>
  findManyUnlinkedByEmail(email: string): Promise<Participant[]>
  findAllByTripId(tripId: string): Promise<Participant[]>
  findAllByTravelerId(travelerId: string): Promise<ParticipantWithTripProps[]>
}

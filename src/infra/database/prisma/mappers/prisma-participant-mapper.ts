import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Participant } from '@/domain/trip/enterprise/entities/participant'
import { Participant as PrismaParticipant, Prisma } from '@prisma/client'

export class PrismaParticipantsMapper {
  static toDomain(raw: PrismaParticipant): Participant {
    return Participant.create(
      {
        name: raw.name ?? '',
        email: raw.email,
        isConfirmed: raw.is_confirmed,
        tripId: new UniqueEntityID(raw.trip_id),
        travelerId: raw.traveler_id
          ? new UniqueEntityID(raw.traveler_id)
          : null,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    participant: Participant,
  ): Prisma.ParticipantUncheckedCreateInput {
    return {
      id: participant.id.toString(),
      name: participant.name,
      email: participant.email,
      is_confirmed: participant.isConfirmed,
      trip_id: participant.tripId.toString(),
      traveler_id: participant.travelerId?.toString(),
    }
  }
}

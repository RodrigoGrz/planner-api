import { ParticipantsRepository } from '@/domain/trip/application/repositories/participants-repository'
import { Participant } from '@/domain/trip/enterprise/entities/participant'
import { getPrismaClient } from '../transaction-context'
import { PrismaParticipantsMapper } from '../mappers/prisma-participant-mapper'
import {
  ParticipantWithTrip,
  ParticipantWithTripProps,
} from '@/domain/trip/enterprise/entities/value-objects/participant-with-trip'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class PrismaParticipantsRepository implements ParticipantsRepository {
  async create(participant: Participant): Promise<void> {
    await getPrismaClient().participant.create({
      data: PrismaParticipantsMapper.toPrisma(participant),
    })
  }

  async update(participant: Participant): Promise<void> {
    await getPrismaClient().participant.update({
      where: { id: participant.id.toString() },
      data: {
        name: participant.name,
        email: participant.email,
        is_confirmed: participant.isConfirmed,
        confirmation_token: participant.confirmationToken,
        traveler_id: participant.travelerId?.toString() ?? null,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await getPrismaClient().participant.delete({
      where: { id },
    })
  }

  async findById(id: string): Promise<Participant | null> {
    const participant = await getPrismaClient().participant.findUnique({
      where: { id },
    })

    if (!participant) {
      return null
    }

    return PrismaParticipantsMapper.toDomain(participant)
  }

  async findByConfirmationToken(token: string): Promise<Participant | null> {
    const participant = await getPrismaClient().participant.findUnique({
      where: {
        confirmation_token: token,
      },
    })

    if (!participant) {
      return null
    }

    return PrismaParticipantsMapper.toDomain(participant)
  }

  async findManyUnlinkedByEmail(email: string): Promise<Participant[]> {
    const participants = await getPrismaClient().participant.findMany({
      where: {
        email,
        traveler_id: null,
      },
    })

    return participants.map(PrismaParticipantsMapper.toDomain)
  }

  async findByTripAndTravelerId(
    tripId: string,
    travelerId: string,
  ): Promise<Participant | null> {
    const participant = await getPrismaClient().participant.findFirst({
      where: {
        trip_id: tripId,
        traveler_id: travelerId,
      },
    })

    if (!participant) {
      return null
    }

    return PrismaParticipantsMapper.toDomain(participant)
  }

  async findByTripIdAndEmail(
    tripId: string,
    email: string,
  ): Promise<Participant | null> {
    const participant = await getPrismaClient().participant.findUnique({
      where: {
        trip_id_email: {
          trip_id: tripId,
          email,
        },
      },
    })

    if (!participant) {
      return null
    }

    return PrismaParticipantsMapper.toDomain(participant)
  }

  async findAllByTripId(tripId: string): Promise<Participant[]> {
    const participants = await getPrismaClient().participant.findMany({
      where: {
        trip_id: tripId,
      },
    })

    return participants.map(PrismaParticipantsMapper.toDomain)
  }

  async findAllByTravelerId(
    travelerId: string,
  ): Promise<ParticipantWithTripProps[]> {
    const participants = await getPrismaClient().participant.findMany({
      where: {
        traveler_id: travelerId,
      },
      include: {
        trip: true,
      },
      orderBy: {
        trip: {
          starts_at: 'desc',
        },
      },
    })

    return participants.map((item) =>
      ParticipantWithTrip.create({
        participantId: new UniqueEntityID(item.id),
        name: item.name,
        email: item.email,
        isConfirmed: item.is_confirmed,
        destination: item.trip.destination,
        startsAt: item.trip.starts_at,
        endsAt: item.trip.ends_at,
        tripId: new UniqueEntityID(item.trip.id),
        coverImageUrl: item.trip.cover_image_url,
      }),
    )
  }
}

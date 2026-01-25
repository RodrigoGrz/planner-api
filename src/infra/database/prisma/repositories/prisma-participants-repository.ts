import { ParticipantsRepository } from '@/domain/trip/application/repositories/participants-repository'
import { Participant } from '@/domain/trip/enterprise/entities/participant'
import { prisma } from '../prisma'
import { PrismaParticipantsMapper } from '../mappers/prisma-participant-mapper'
import {
  ParticipantWithTrip,
  ParticipantWithTripProps,
} from '@/domain/trip/enterprise/entities/value-objects/participant-with-trip'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class PrismaParticipantsRepository implements ParticipantsRepository {
  async create(participant: Participant): Promise<void> {
    await prisma.participant.create({
      data: PrismaParticipantsMapper.toPrisma(participant),
    })
  }

  async findAllByTripId(tripId: string): Promise<Participant[]> {
    const participants = await prisma.participant.findMany({
      where: {
        trip_id: tripId,
      },
    })

    return participants.map(PrismaParticipantsMapper.toDomain)
  }

  async findAllByTravelerId(
    travelerId: string,
  ): Promise<ParticipantWithTripProps[]> {
    const participants = await prisma.participant.findMany({
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

  async findNextTripByTravelerId(
    travelerId: string,
  ): Promise<ParticipantWithTripProps | null> {
    const participant = await prisma.participant.findFirst({
      where: {
        traveler_id: travelerId,
        trip: {
          starts_at: {
            gte: new Date(),
          },
        },
      },
      include: {
        trip: true,
      },
      orderBy: {
        trip: {
          starts_at: 'asc',
        },
      },
    })

    if (!participant) {
      return null
    }

    return ParticipantWithTrip.create({
      participantId: new UniqueEntityID(participant.id),
      name: participant.name,
      email: participant.email,
      isConfirmed: participant.is_confirmed,
      destination: participant.trip.destination,
      startsAt: participant.trip.starts_at,
      endsAt: participant.trip.ends_at,
      tripId: new UniqueEntityID(participant.trip.id),
      coverImageUrl: participant.trip.cover_image_url,
    })
  }
}

import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { GetTripParticipantsUseCase } from '../get-trip-participants'

export function getTripParticipantsFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const tripsRepository = new PrismaTripsRepository()
  const getTripParticipantsUseCase = new GetTripParticipantsUseCase(
    participantsRepository,
    tripsRepository,
  )

  return getTripParticipantsUseCase
}

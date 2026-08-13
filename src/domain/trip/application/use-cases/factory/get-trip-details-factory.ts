import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { GetTripDetailsUseCase } from '../get-trip-details'

export function getTripDetailsFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const participantsRepository = new PrismaParticipantsRepository()
  const getTripsDetailsUseCase = new GetTripDetailsUseCase(
    tripsRepository,
    participantsRepository,
  )

  return getTripsDetailsUseCase
}

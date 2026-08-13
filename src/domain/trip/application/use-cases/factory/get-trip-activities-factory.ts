import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { GetTripActivitiesUseCase } from '../get-trip-activities'

export function getTripActivitiesFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const participantsRepository = new PrismaParticipantsRepository()
  const getTripActivitiesUseCase = new GetTripActivitiesUseCase(
    tripsRepository,
    participantsRepository,
  )

  return getTripActivitiesUseCase
}

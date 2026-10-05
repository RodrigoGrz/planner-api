import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { RemoveTripParticipantUseCase } from '../remove-trip-participant'

export function removeTripParticipantFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const tripsRepository = new PrismaTripsRepository()
  const removeTripParticipantUseCase = new RemoveTripParticipantUseCase(
    participantsRepository,
    tripsRepository,
  )

  return removeTripParticipantUseCase
}

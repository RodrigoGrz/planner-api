import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { ConfirmParticipantUseCase } from '../confirm-participant'

export function confirmParticipantFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const tripsRepository = new PrismaTripsRepository()
  const confirmParticipantUseCase = new ConfirmParticipantUseCase(
    participantsRepository,
    tripsRepository,
  )

  return confirmParticipantUseCase
}

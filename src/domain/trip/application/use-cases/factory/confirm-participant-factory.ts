import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'
import { ConfirmParticipantUseCase } from '../confirm-participant'

export function confirmParticipantFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const tripsRepository = new PrismaTripsRepository()
  const travelersRepository = new PrismaTravelersRepository()
  const confirmParticipantUseCase = new ConfirmParticipantUseCase(
    participantsRepository,
    tripsRepository,
    travelersRepository,
  )

  return confirmParticipantUseCase
}

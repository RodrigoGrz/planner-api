import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { GetAllTravelerTripsUseCase } from '../get-all-traveler-trips'
import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'

export function getAllTravelerTripsFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const travelersRepository = new PrismaTravelersRepository()
  const getAllTravelerTripsUseCase = new GetAllTravelerTripsUseCase(
    participantsRepository,
    travelersRepository,
  )

  return getAllTravelerTripsUseCase
}

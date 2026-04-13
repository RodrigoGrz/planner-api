import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'
import { GetAllTravelersByTripUseCase } from '../get-all-travelers-by-trips'

export function getAllTravelersByTripFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const travelersRepository = new PrismaTravelersRepository()
  const getAllTravelersByTripUseCase = new GetAllTravelersByTripUseCase(
    participantsRepository,
    travelersRepository,
  )

  return getAllTravelersByTripUseCase
}

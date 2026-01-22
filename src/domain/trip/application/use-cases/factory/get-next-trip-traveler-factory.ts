import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { GetNextTripTravelerUseCase } from '../get-next-trip-traveler'

export function getNextTripTravelerFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const getNextTripTravelerUseCase = new GetNextTripTravelerUseCase(
    participantsRepository,
  )

  return getNextTripTravelerUseCase
}

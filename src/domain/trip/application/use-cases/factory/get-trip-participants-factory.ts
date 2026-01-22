import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { GetTripParticipantsUseCase } from '../get-trip-participants'

export function getTripParticipantsFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const getTripParticipantsUseCase = new GetTripParticipantsUseCase(
    participantsRepository,
  )

  return getTripParticipantsUseCase
}

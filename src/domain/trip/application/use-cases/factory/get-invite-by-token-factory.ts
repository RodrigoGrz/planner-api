import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { GetInviteByTokenUseCase } from '../get-invite-by-token'

export function getInviteByTokenFactory() {
  const participantsRepository = new PrismaParticipantsRepository()
  const tripsRepository = new PrismaTripsRepository()
  const getInviteByTokenUseCase = new GetInviteByTokenUseCase(
    participantsRepository,
    tripsRepository,
  )

  return getInviteByTokenUseCase
}

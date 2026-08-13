import { PrismaLinksRepository } from '@/infra/database/prisma/repositories/prisma-links-repository'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { GetTripLinksUseCase } from '../get-trip-links'

export function getTripLinksFactory() {
  const linksRepository = new PrismaLinksRepository()
  const tripsRepository = new PrismaTripsRepository()
  const participantsRepository = new PrismaParticipantsRepository()
  const getTripLinksUseCase = new GetTripLinksUseCase(
    linksRepository,
    tripsRepository,
    participantsRepository,
  )

  return getTripLinksUseCase
}

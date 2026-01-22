import { PrismaLinksRepository } from '@/infra/database/prisma/repositories/prisma-links-repository'
import { CreateTripLinkUseCase } from '../create-trip-link'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'

export function createTripLinkFactory() {
  const linksRepository = new PrismaLinksRepository()
  const tripsRepository = new PrismaTripsRepository()
  const createTripLinkUseCase = new CreateTripLinkUseCase(
    linksRepository,
    tripsRepository,
  )

  return createTripLinkUseCase
}

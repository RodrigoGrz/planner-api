import { PrismaLinksRepository } from '@/infra/database/prisma/repositories/prisma-links-repository'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { DeleteTripLinkUseCase } from '../delete-trip-link'

export function deleteTripLinkFactory() {
  const linksRepository = new PrismaLinksRepository()
  const tripsRepository = new PrismaTripsRepository()
  const deleteTripLinkUseCase = new DeleteTripLinkUseCase(
    linksRepository,
    tripsRepository,
  )

  return deleteTripLinkUseCase
}

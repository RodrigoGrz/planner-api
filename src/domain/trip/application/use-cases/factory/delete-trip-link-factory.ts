import { PrismaLinksRepository } from '@/infra/database/prisma/repositories/prisma-links-repository'
import { DeleteTripLinkUseCase } from '../delete-trip-link'

export function deleteTripLinkFactory() {
  const linksRepository = new PrismaLinksRepository()
  const deleteTripLinkUseCase = new DeleteTripLinkUseCase(linksRepository)

  return deleteTripLinkUseCase
}

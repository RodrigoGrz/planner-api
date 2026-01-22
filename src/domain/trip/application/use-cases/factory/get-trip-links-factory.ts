import { PrismaLinksRepository } from '@/infra/database/prisma/repositories/prisma-links-repository'
import { GetTripLinksUseCase } from '../get-trip-links'

export function getTripLinksFactory() {
  const linksRepository = new PrismaLinksRepository()
  const getTripLinksUseCase = new GetTripLinksUseCase(linksRepository)

  return getTripLinksUseCase
}

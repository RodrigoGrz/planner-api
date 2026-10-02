import { DeleteTripUseCase } from '../delete-trip'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { R2Storage } from '@/infra/storage/r2-storage'

export function deleteTripFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const uploader = new R2Storage()
  const deleteTripUseCase = new DeleteTripUseCase(tripsRepository, uploader)

  return deleteTripUseCase
}

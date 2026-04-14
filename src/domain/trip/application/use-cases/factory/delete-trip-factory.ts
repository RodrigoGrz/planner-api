import { DeleteTripUseCase } from '../delete-trip'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'

export function deleteTripFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const deleteTripUseCase = new DeleteTripUseCase(tripsRepository)

  return deleteTripUseCase
}

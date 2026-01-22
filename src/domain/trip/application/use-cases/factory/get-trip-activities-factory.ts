import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { GetTripActivitiesUseCase } from '../get-trip-activities'

export function getTripActivitiesFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const getTripActivitiesUseCase = new GetTripActivitiesUseCase(tripsRepository)

  return getTripActivitiesUseCase
}

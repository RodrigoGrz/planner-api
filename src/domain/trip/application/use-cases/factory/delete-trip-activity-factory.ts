import { DeleteTripActivityUseCase } from '../delete-trip-activity'
import { PrismaActivitiesRepository } from '@/infra/database/prisma/repositories/prisma-activities-repository'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'

export function deleteTripActivityFactory() {
  const activitiesRepository = new PrismaActivitiesRepository()
  const tripsRepository = new PrismaTripsRepository()
  const deleteTripActivityUseCase = new DeleteTripActivityUseCase(
    activitiesRepository,
    tripsRepository,
  )

  return deleteTripActivityUseCase
}

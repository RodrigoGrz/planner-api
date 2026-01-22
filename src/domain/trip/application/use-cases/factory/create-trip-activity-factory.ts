import { PrismaActivitiesRepository } from '@/infra/database/prisma/repositories/prisma-activities-repository'
import { CreateTripActivityUseCase } from '../create-trip-activity'
import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'

export function createTripActivityFactory() {
  const activitiesRepository = new PrismaActivitiesRepository()
  const tripsRepository = new PrismaTripsRepository()
  const createTripActivityUseCase = new CreateTripActivityUseCase(
    activitiesRepository,
    tripsRepository,
  )

  return createTripActivityUseCase
}

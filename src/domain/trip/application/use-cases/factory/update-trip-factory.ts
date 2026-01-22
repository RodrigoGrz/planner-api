import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { UpdateTripUseCase } from '../update-trip'
import { PrismaActivitiesRepository } from '@/infra/database/prisma/repositories/prisma-activities-repository'

export function updateTripFactory() {
  const activitiesRepository = new PrismaActivitiesRepository()
  const tripsRepository = new PrismaTripsRepository()
  const updateTripUseCase = new UpdateTripUseCase(
    tripsRepository,
    activitiesRepository,
  )

  return updateTripUseCase
}

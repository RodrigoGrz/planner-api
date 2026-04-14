import { DeleteTripActivityUseCase } from '../delete-trip-activity'
import { PrismaActivitiesRepository } from '@/infra/database/prisma/repositories/prisma-activities-repository'

export function deleteTripActivityFactory() {
  const activitiesRepository = new PrismaActivitiesRepository()
  const deleteTripActivityUseCase = new DeleteTripActivityUseCase(
    activitiesRepository,
  )

  return deleteTripActivityUseCase
}

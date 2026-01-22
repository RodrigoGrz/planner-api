import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { GetTripDetailsUseCase } from '../get-trip-details'

export function getTripDetailsFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const getTripsDetailsUseCase = new GetTripDetailsUseCase(tripsRepository)

  return getTripsDetailsUseCase
}

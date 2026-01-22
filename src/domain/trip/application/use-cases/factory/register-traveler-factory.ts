import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'
import { RegisterTravelerUseCase } from '../register-traveler'

export function registerTravelerFactory() {
  const travelersRepository = new PrismaTravelersRepository()
  const registerTraveler = new RegisterTravelerUseCase(travelersRepository)

  return registerTraveler
}

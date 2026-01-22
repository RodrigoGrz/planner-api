import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'
import { AuthenticateUseCase } from '../authenticate'

export function authenticateFactory() {
  const prismaTravelersRepository = new PrismaTravelersRepository()
  const authenticateUseCase = new AuthenticateUseCase(prismaTravelersRepository)

  return authenticateUseCase
}

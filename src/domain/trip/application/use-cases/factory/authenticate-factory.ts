import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher'
import { AuthenticateUseCase } from '../authenticate'

export function authenticateFactory() {
  const prismaTravelersRepository = new PrismaTravelersRepository()
  const bcryptHasher = new BcryptHasher()
  const authenticateUseCase = new AuthenticateUseCase(
    prismaTravelersRepository,
    bcryptHasher,
    bcryptHasher,
  )

  return authenticateUseCase
}

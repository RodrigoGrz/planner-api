import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'
import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { PrismaTransactionManager } from '@/infra/database/prisma/prisma-transaction-manager'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher'
import { RegisterTravelerUseCase } from '../register-traveler'

export function registerTravelerFactory() {
  const travelersRepository = new PrismaTravelersRepository()
  const participantsRepository = new PrismaParticipantsRepository()
  const transactionManager = new PrismaTransactionManager()
  const bcryptHasher = new BcryptHasher()
  const registerTraveler = new RegisterTravelerUseCase(
    travelersRepository,
    participantsRepository,
    transactionManager,
    bcryptHasher,
  )

  return registerTraveler
}

import { AsyncLocalStorage } from 'node:async_hooks'
import { Prisma } from 'prisma/generated/prisma/client'
import { prisma } from './prisma'

const transactionStorage = new AsyncLocalStorage<Prisma.TransactionClient>()

export function getPrismaClient(): Prisma.TransactionClient {
  return transactionStorage.getStore() ?? prisma
}

export async function runInPrismaTransaction<T>(
  fn: () => Promise<T>,
): Promise<T> {
  if (transactionStorage.getStore()) {
    return fn()
  }

  return prisma.$transaction((tx) => transactionStorage.run(tx, fn))
}

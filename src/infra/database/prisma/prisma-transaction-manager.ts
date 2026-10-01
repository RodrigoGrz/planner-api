import { TransactionManager } from '@/domain/trip/application/transaction/transaction-manager'
import { runInPrismaTransaction } from './transaction-context'

export class PrismaTransactionManager implements TransactionManager {
  run<T>(fn: () => Promise<T>): Promise<T> {
    return runInPrismaTransaction(fn)
  }
}

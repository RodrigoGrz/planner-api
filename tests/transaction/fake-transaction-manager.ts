import { TransactionManager } from '@/domain/trip/application/transaction/transaction-manager'

export class FakeTransactionManager implements TransactionManager {
  async run<T>(fn: () => Promise<T>): Promise<T> {
    return fn()
  }
}

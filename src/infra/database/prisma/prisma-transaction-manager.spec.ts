import { makeTraveler } from 'tests/factories/make-traveler'
import { PrismaTransactionManager } from './prisma-transaction-manager'
import { PrismaTravelersRepository } from './repositories/prisma-travelers-repository'

let transactionManager: PrismaTransactionManager
let travelersRepository: PrismaTravelersRepository

describe('PrismaTransactionManager (integration)', () => {
  beforeAll(() => {
    transactionManager = new PrismaTransactionManager()
    travelersRepository = new PrismaTravelersRepository()
  })

  it('should rollback every write when the callback throws', async () => {
    const traveler = await makeTraveler()

    await expect(
      transactionManager.run(async () => {
        await travelersRepository.create(traveler)
        throw new Error('forced failure')
      }),
    ).rejects.toThrow('forced failure')

    const stored = await travelersRepository.findById(traveler.id.toString())

    expect(stored).toBeNull()
  })

  it('should commit every write when the callback resolves', async () => {
    const traveler = await makeTraveler()

    await transactionManager.run(async () => {
      await travelersRepository.create(traveler)
    })

    const stored = await travelersRepository.findById(traveler.id.toString())

    expect(stored?.id.toString()).toBe(traveler.id.toString())
  })
})

import { TravelersRepository } from '@/domain/trip/application/repositories/travelers-repository'
import { Traveler } from '@/domain/trip/enterprise/entities/traveler'
import { getPrismaClient } from '../transaction-context'
import { PrismaTravelerMapper } from '../mappers/prisma-traveler-mapper'

export class PrismaTravelersRepository implements TravelersRepository {
  async create(traveler: Traveler): Promise<void> {
    await getPrismaClient().traveler.create({
      data: PrismaTravelerMapper.toPrisma(traveler),
    })
  }

  async findByEmail(email: string): Promise<Traveler | null> {
    const traveler = await getPrismaClient().traveler.findUnique({
      where: {
        email,
      },
    })

    if (!traveler) {
      return null
    }

    return PrismaTravelerMapper.toDomain(traveler)
  }

  async findById(id: string): Promise<Traveler | null> {
    const traveler = await getPrismaClient().traveler.findUnique({
      where: {
        id,
      },
    })

    if (!traveler) {
      return null
    }

    return PrismaTravelerMapper.toDomain(traveler)
  }

  async findManyByEmails(emails: string[]): Promise<Traveler[]> {
    const travelers = await getPrismaClient().traveler.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    })

    return travelers.map(PrismaTravelerMapper.toDomain)
  }
}

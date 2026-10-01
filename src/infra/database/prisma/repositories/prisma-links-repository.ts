import { LinksRepository } from '@/domain/trip/application/repositories/links-repository'
import { Link } from '@/domain/trip/enterprise/entities/link'
import { getPrismaClient } from '../transaction-context'
import { PrismaLinksMapper } from '../mappers/prisma-link-mapper'

export class PrismaLinksRepository implements LinksRepository {
  async create(link: Link): Promise<void> {
    await getPrismaClient().link.create({
      data: PrismaLinksMapper.toPrisma(link),
    })
  }

  async findById(id: string): Promise<Link | null> {
    const link = await getPrismaClient().link.findUnique({
      where: {
        id,
      },
    })

    if (!link) {
      return null
    }

    return PrismaLinksMapper.toDomain(link)
  }

  async findAllByTripId(tripId: string): Promise<Link[]> {
    const links = await getPrismaClient().link.findMany({
      where: {
        trip_id: tripId,
      },
    })

    return links.map(PrismaLinksMapper.toDomain)
  }

  async delete(id: string): Promise<void> {
    await getPrismaClient().link.delete({
      where: {
        id,
      },
    })
  }
}

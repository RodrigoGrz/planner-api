import { LinksRepository } from '@/domain/trip/application/repositories/links-repository'
import { Link } from '@/domain/trip/enterprise/entities/link'
import { prisma } from '../prisma'
import { PrismaLinksMapper } from '../mappers/prisma-link-mapper'

export class PrismaLinksRepository implements LinksRepository {
  async create(link: Link): Promise<void> {
    await prisma.link.create({
      data: PrismaLinksMapper.toPrisma(link),
    })
  }

  async findAllByTripId(tripId: string): Promise<Link[]> {
    const links = await prisma.link.findMany({
      where: {
        trip_id: tripId,
      },
    })

    return links.map(PrismaLinksMapper.toDomain)
  }
}

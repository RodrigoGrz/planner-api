import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Link } from '@/domain/trip/enterprise/entities/link'
import { Link as PrismaLink, Prisma } from '@prisma/client'

export class PrismaLinksMapper {
  static toDomain(raw: PrismaLink): Link {
    return Link.create(
      {
        title: raw.title,
        url: raw.url,
        tripId: new UniqueEntityID(raw.trip_id),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(link: Link): Prisma.LinkUncheckedCreateInput {
    return {
      id: link.id.toString(),
      title: link.title,
      url: link.url,
      trip_id: link.tripId.toString(),
    }
  }
}

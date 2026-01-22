import { faker } from '@faker-js/faker'
import { Link, LinkProps } from '@/domain/trip/enterprise/entities/link'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { prisma } from '@/infra/database/prisma/prisma'
import { PrismaLinksMapper } from '@/infra/database/prisma/mappers/prisma-link-mapper'

export async function makeLink(override: Partial<LinkProps> = {}, id?: string) {
  const link = Link.create(
    {
      title: faker.word.sample(),
      url: faker.internet.url(),
      tripId: new UniqueEntityID(),
      ...override,
    },
    new UniqueEntityID(id),
  )

  return link
}

export async function makePrismaLink(
  data: Partial<LinkProps> = {},
): Promise<Link> {
  const link = await makeLink(data)

  await prisma.link.create({
    data: PrismaLinksMapper.toPrisma(link),
  })

  return link
}

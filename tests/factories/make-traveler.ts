import { faker } from '@faker-js/faker'
import {
  Traveler,
  TravelerProps,
} from '@/domain/trip/enterprise/entities/traveler'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { prisma } from '@/infra/database/prisma/prisma'
import { PrismaTravelerMapper } from '@/infra/database/prisma/mappers/prisma-traveler-mapper'

export async function makeTraveler(
  override: Partial<TravelerProps> = {},
  id?: string,
) {
  const traveler = Traveler.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phone: faker.phone.imei(),
      ...override,
    },
    new UniqueEntityID(id),
  )

  return traveler
}

export async function makePrismaTraveler(
  data: Partial<TravelerProps> = {},
): Promise<Traveler> {
  const traveler = await makeTraveler(data)

  await prisma.traveler.create({
    data: PrismaTravelerMapper.toPrisma(traveler),
  })

  return traveler
}

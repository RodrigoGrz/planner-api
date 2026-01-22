import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Traveler } from '@/domain/trip/enterprise/entities/traveler'
import { Traveler as PrismaTraveler, Prisma } from '@prisma/client'

export class PrismaTravelerMapper {
  static toDomain(raw: PrismaTraveler): Traveler {
    return Traveler.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        phone: raw.phone,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(traveler: Traveler): Prisma.TravelerUncheckedCreateInput {
    return {
      id: traveler.id.toString(),
      name: traveler.name,
      email: traveler.email,
      password: traveler.password,
      phone: traveler.phone,
    }
  }
}

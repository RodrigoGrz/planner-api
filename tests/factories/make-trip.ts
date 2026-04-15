import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { prisma } from '@/infra/database/prisma/prisma'
import { Trip, TripProps } from '@/domain/trip/enterprise/entities/trip'
import { PrismaTripMapper } from '@/infra/database/prisma/mappers/prisma-trip-mapper'
import { dayjs } from '@/lib/dayjs'

export async function makeTrip(override: Partial<TripProps> = {}, id?: string) {
  const trip = Trip.create(
    {
      destination: faker.word.sample(),
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: new UniqueEntityID(),
      coverImageUrl: null,
      ...override,
    },
    new UniqueEntityID(id),
  )

  return trip
}

export async function makePrismaTrip(
  data: Partial<TripProps> = {},
): Promise<Trip> {
  const trip = await makeTrip(data)

  await prisma.trip.create({
    data: PrismaTripMapper.toPrisma(trip),
  })

  return trip
}

import { faker } from '@faker-js/faker'
import {
  Activity,
  ActivityProps,
} from '@/domain/trip/enterprise/entities/activity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { prisma } from '@/infra/database/prisma/prisma'
import { PrismaActivityMapper } from '@/infra/database/prisma/mappers/prisma-activity-mapper'

export async function makeActivity(
  override: Partial<ActivityProps> = {},
  id?: string,
) {
  const activity = Activity.create(
    {
      title: faker.word.sample(),
      occursAt: faker.date.future(),
      tripId: new UniqueEntityID(),
      ...override,
    },
    new UniqueEntityID(id),
  )

  return activity
}

export async function makePrismaActivity(
  data: Partial<ActivityProps> = {},
): Promise<Activity> {
  const activity = await makeActivity(data)

  await prisma.activity.create({
    data: PrismaActivityMapper.toPrisma(activity),
  })

  return activity
}

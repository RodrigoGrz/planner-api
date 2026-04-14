import { ActivitiesRepository } from '@/domain/trip/application/repositories/activities-repository'
import { Activity } from '@/domain/trip/enterprise/entities/activity'
import { prisma } from '../prisma'
import { PrismaActivityMapper } from '../mappers/prisma-activity-mapper'

export class PrismaActivitiesRepository implements ActivitiesRepository {
  async create(activity: Activity): Promise<void> {
    await prisma.activity.create({
      data: PrismaActivityMapper.toPrisma(activity),
    })
  }

  async findById(id: string): Promise<Activity | null> {
    const activity = await prisma.activity.findUnique({
      where: {
        id,
      },
    })

    if (!activity) {
      return null
    }

    return PrismaActivityMapper.toDomain(activity)
  }

  async deleteOutsideTripPeriod(
    tripId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<void> {
    await prisma.activity.deleteMany({
      where: {
        trip_id: tripId,
        OR: [{ occurs_at: { lt: startsAt } }, { occurs_at: { gt: endsAt } }],
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.activity.delete({
      where: {
        id,
      },
    })
  }
}

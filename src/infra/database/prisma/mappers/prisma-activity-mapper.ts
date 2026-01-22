import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Activity } from '@/domain/trip/enterprise/entities/activity'
import { Activity as PrismaActivity, Prisma } from '@prisma/client'

export class PrismaActivityMapper {
  static toDomain(raw: PrismaActivity): Activity {
    return Activity.create(
      {
        title: raw.title,
        occursAt: raw.occurs_at,
        tripId: new UniqueEntityID(raw.trip_id),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(activity: Activity): Prisma.ActivityUncheckedCreateInput {
    return {
      id: activity.id.toString(),
      title: activity.title,
      occurs_at: activity.occursAt,
      trip_id: activity.tripId.toString(),
    }
  }
}

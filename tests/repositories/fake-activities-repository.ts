import { ActivitiesRepository } from '@/domain/trip/application/repositories/activities-repository'
import { Activity } from '@/domain/trip/enterprise/entities/activity'
import { dayjs } from '@/lib/dayjs'

export class FakeActivitiesRepository implements ActivitiesRepository {
  public items: Activity[] = []

  async create(activity: Activity): Promise<void> {
    this.items.push(activity)
  }

  async findById(id: string): Promise<Activity | null> {
    const activity = this.items.find((item) => item.id.toString() === id)

    if (!activity) {
      return null
    }

    return activity
  }

  async deleteOutsideTripPeriod(
    tripId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<void> {
    this.items = this.items.filter((activity) => {
      if (activity.tripId.toString() !== tripId) {
        return true
      }

      const date = dayjs(activity.occursAt)

      const outsidePeriod = date.isBefore(startsAt) || date.isAfter(endsAt)

      return !outsidePeriod
    })
  }

  async delete(id: string): Promise<void> {
    const activityIndex = this.items.findIndex(
      (value) => value.id.toString() === id,
    )

    this.items.splice(activityIndex, 1)
  }
}

import { ActivitiesRepository } from '@/domain/trip/application/repositories/activities-repository'
import { Activity } from '@/domain/trip/enterprise/entities/activity'
import dayjs from 'dayjs'

export class FakeActivitiesRepository implements ActivitiesRepository {
  public items: Activity[] = []

  async create(activity: Activity): Promise<void> {
    this.items.push(activity)
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
}

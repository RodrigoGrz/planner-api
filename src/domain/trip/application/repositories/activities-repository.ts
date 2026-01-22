import { Activity } from '../../enterprise/entities/activity'

export interface ActivitiesRepository {
  create(activity: Activity): Promise<void>
  deleteOutsideTripPeriod(
    tripId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<void>
}

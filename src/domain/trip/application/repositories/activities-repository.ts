import { Activity } from '../../enterprise/entities/activity'

export interface ActivitiesRepository {
  create(activity: Activity): Promise<void>
  findById(id: string): Promise<Activity | null>
  deleteOutsideTripPeriod(
    tripId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<void>
  delete(id: string): Promise<void>
}

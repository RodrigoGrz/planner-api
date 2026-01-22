import { Activity } from '@/domain/trip/enterprise/entities/activity'

interface ActivitiesByDay {
  date: Date
  activities: Activity[]
}

export class TripActivitiesByDayPresenter {
  static toHTTP(data: ActivitiesByDay) {
    return {
      date: data.date,
      activities: data.activities.map((activity) => ({
        id: activity.id.toString(),
        title: activity.title,
        occursAt: activity.occursAt,
      })),
    }
  }
}

import { Either, left, right } from '@/core/either'
import { Activity } from '../../enterprise/entities/activity'
import dayjs from 'dayjs'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'

interface GetTripActivitiesUseCaseRequest {
  tripId: string
}

type GetTripActivitiesUseCaseResponse = Either<
  ResourceNotExistsError,
  {
    activities: {
      date: Date
      activities: Activity[]
    }[]
  }
>

export class GetTripActivitiesUseCase {
  constructor(private tripsRepository: TripsRepository) {}

  async execute({
    tripId,
  }: GetTripActivitiesUseCaseRequest): Promise<GetTripActivitiesUseCaseResponse> {
    const trip = await this.tripsRepository.findByIdWithActivities(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.endsAt).diff(
      trip.startsAt,
      'days',
    )

    const activities = Array.from({
      length: differenceInDaysBetweenTripStartAndEnd + 1,
    }).map((_, daysToAdd) => {
      const dateToCompare = dayjs(trip.startsAt).add(daysToAdd, 'days')

      return {
        date: dateToCompare.toDate(),
        activities: trip.activities
          .filter((activity) => {
            return dayjs(activity.occursAt).isSame(dateToCompare, 'day')
          })
          .sort(
            (a, b) => dayjs(a.occursAt).valueOf() - dayjs(b.occursAt).valueOf(),
          ),
      }
    })

    return right({
      activities,
    })
  }
}

import { Either, left, right } from '@/core/either'
import { Activity } from '../../enterprise/entities/activity'
import { dayjs } from '@/lib/dayjs'
import { TripsRepository } from '../repositories/trips-repository'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { canAccessTrip } from '../authorization/trip-access'
import {
  MAX_TRIP_DURATION_IN_DAYS,
  getTripDurationInDays,
} from '../trip-period/trip-duration'

interface GetTripActivitiesUseCaseRequest {
  tripId: string
  travelerId: string
}

type GetTripActivitiesUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError,
  {
    activities: {
      date: Date
      activities: Activity[]
    }[]
  }
>

export class GetTripActivitiesUseCase {
  constructor(
    private tripsRepository: TripsRepository,
    private participantsRepository: ParticipantsRepository,
  ) {}

  async execute({
    tripId,
    travelerId,
  }: GetTripActivitiesUseCaseRequest): Promise<GetTripActivitiesUseCaseResponse> {
    const tripForAccess = await this.tripsRepository.findById(tripId)

    if (!tripForAccess) {
      return left(new ResourceNotExistsError())
    }

    const hasAccess = await canAccessTrip(
      tripForAccess,
      travelerId,
      this.participantsRepository,
    )

    if (!hasAccess) {
      return left(new NotAllowedError())
    }

    const trip = await this.tripsRepository.findByIdWithActivities(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    const listedDurationInDays = Math.min(
      getTripDurationInDays(trip.startsAt, trip.endsAt),
      MAX_TRIP_DURATION_IN_DAYS,
    )

    const activities = Array.from({
      length: listedDurationInDays + 1,
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

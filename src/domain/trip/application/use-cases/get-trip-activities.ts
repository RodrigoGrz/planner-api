import { Either, left, right } from '@/core/either'
import { Activity } from '../../enterprise/entities/activity'
import { TripsRepository } from '../repositories/trips-repository'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { canAccessTrip } from '../authorization/trip-access'
import {
  MAX_TRIP_DURATION_IN_DAYS,
  getTripDurationInDays,
} from '../trip-period/trip-duration'
import { toTripDay } from '../trip-period/trip-day'

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

    const firstTripDay = toTripDay(trip.startsAt)

    const activities = Array.from({
      length: listedDurationInDays + 1,
    }).map((_, daysToAdd) => {
      const tripDay = firstTripDay.add(daysToAdd, 'day')

      return {
        date: tripDay.toDate(),
        activities: trip.activities
          .filter((activity) => {
            return toTripDay(activity.occursAt).isSame(tripDay)
          })
          .sort((a, b) => a.occursAt.getTime() - b.occursAt.getTime()),
      }
    })

    return right({
      activities,
    })
  }
}

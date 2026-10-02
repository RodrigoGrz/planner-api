import { Either, left, right } from '@/core/either'
import { ActivitiesRepository } from '../repositories/activities-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { InvalidDate } from './errors/invalid-date-error'
import { Activity } from '../../enterprise/entities/activity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from './errors/not-allowed-error'
import { isTripOwner } from '../authorization/trip-access'
import { getTripPeriodBounds } from '../trip-period/trip-day'

interface CreateTripActivityUseCaseRequest {
  title: string
  occursAt: Date
  tripId: string
  travelerId: string
}

type CreateTripActivityUseCaseResponse = Either<
  ResourceNotExistsError | InvalidDate | NotAllowedError,
  { activity: Activity }
>

export class CreateTripActivityUseCase {
  constructor(
    private activitiesRepository: ActivitiesRepository,
    private tripsRepository: TripsRepository,
  ) {}

  async execute({
    title,
    occursAt,
    tripId,
    travelerId,
  }: CreateTripActivityUseCaseRequest): Promise<CreateTripActivityUseCaseResponse> {
    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(trip, travelerId)) {
      return left(new NotAllowedError())
    }

    const { firstMoment, lastMoment } = getTripPeriodBounds(
      trip.startsAt,
      trip.endsAt,
    )

    if (occursAt < firstMoment || occursAt > lastMoment) {
      return left(new InvalidDate())
    }

    const activity = Activity.create({
      title,
      occursAt,
      tripId: new UniqueEntityID(tripId),
    })

    await this.activitiesRepository.create(activity)

    return right({
      activity,
    })
  }
}

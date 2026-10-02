import { Either, left, right } from '@/core/either'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { Trip } from '../../enterprise/entities/trip'
import { dayjs } from '@/lib/dayjs'
import { InvalidTripStartDate } from './errors/invalid-trip-start-date-error'
import { InvalidTripEndDate } from './errors/invalid-trip-end-date-error'
import { ActivitiesRepository } from '../repositories/activities-repository'
import { NotAllowedError } from './errors/not-allowed-error'
import { isTripOwner } from '../authorization/trip-access'
import { InvalidTripDuration } from './errors/invalid-trip-duration-error'
import { validateTripPeriod } from '../trip-period/validate-trip-period'

interface UpdateTripUseCaseRequest {
  tripId: string
  travelerId: string
  destination: string
  startsAt: Date
  endsAt: Date
}

type UpdateTripUseCaseResponse = Either<
  | ResourceNotExistsError
  | InvalidTripStartDate
  | InvalidTripEndDate
  | InvalidTripDuration
  | NotAllowedError,
  { trip: Trip }
>

export class UpdateTripUseCase {
  constructor(
    private tripsRepository: TripsRepository,
    private activitiesRepository: ActivitiesRepository,
  ) {}

  async execute({
    tripId,
    travelerId,
    startsAt,
    endsAt,
    destination,
  }: UpdateTripUseCaseRequest): Promise<UpdateTripUseCaseResponse> {
    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(trip, travelerId)) {
      return left(new NotAllowedError())
    }

    const periodValidation = validateTripPeriod({
      startsAt,
      endsAt,
      currentPeriod: { startsAt: trip.startsAt, endsAt: trip.endsAt },
    })

    if (periodValidation.isLeft()) {
      return left(periodValidation.value)
    }

    const periodTimestampsChanged =
      !dayjs(startsAt).isSame(trip.startsAt) ||
      !dayjs(endsAt).isSame(trip.endsAt)

    trip.destination = destination
    trip.startsAt = startsAt
    trip.endsAt = endsAt

    await this.tripsRepository.runInTransaction(async () => {
      if (periodTimestampsChanged) {
        await this.activitiesRepository.deleteOutsideTripPeriod(
          trip.id.toString(),
          startsAt,
          endsAt,
        )
      }

      await this.tripsRepository.update(trip)
    })

    return right({
      trip,
    })
  }
}

import { Either, left, right } from '@/core/either'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { Trip } from '../../enterprise/entities/trip'
import { dayjs } from '@/lib/dayjs'
import { InvalidTripStartDate } from './errors/invalid-trip-start-date-error'
import { InvalidTripEndDate } from './errors/invalid-trip-end-date-error'
import { ActivitiesRepository } from '../repositories/activities-repository'

interface UpdateTripUseCaseRequest {
  tripId: string
  destination: string
  startsAt: Date
  endsAt: Date
}

type UpdateTripUseCaseResponse = Either<
  ResourceNotExistsError | InvalidTripStartDate | InvalidTripEndDate,
  { trip: Trip }
>

export class UpdateTripUseCase {
  constructor(
    private tripsRepository: TripsRepository,
    private activitiesRepository: ActivitiesRepository,
  ) {}

  async execute({
    tripId,
    startsAt,
    endsAt,
    destination,
  }: UpdateTripUseCaseRequest): Promise<UpdateTripUseCaseResponse> {
    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (dayjs(startsAt).isBefore(new Date())) {
      return left(new InvalidTripStartDate())
    }

    if (dayjs(endsAt).isBefore(startsAt)) {
      return left(new InvalidTripEndDate())
    }

    const datesChanged =
      !dayjs(startsAt).isSame(trip.startsAt) ||
      !dayjs(endsAt).isSame(trip.endsAt)

    if (datesChanged) {
      await this.activitiesRepository.deleteOutsideTripPeriod(
        trip.id.toString(),
        startsAt,
        endsAt,
      )
    }

    trip.destination = destination
    trip.startsAt = startsAt
    trip.endsAt = endsAt

    await this.tripsRepository.update(trip)

    return right({
      trip,
    })
  }
}

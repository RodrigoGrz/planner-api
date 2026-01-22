import { Either, left, right } from '@/core/either'
import { ActivitiesRepository } from '../repositories/activities-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import dayjs from 'dayjs'
import { InvalidDate } from './errors/invalid-date-error'
import { Activity } from '../../enterprise/entities/activity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface CreateTripActivityUseCaseRequest {
  title: string
  occursAt: Date
  tripId: string
}

type CreateTripActivityUseCaseResponse = Either<
  ResourceNotExistsError | InvalidDate,
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
  }: CreateTripActivityUseCaseRequest): Promise<CreateTripActivityUseCaseResponse> {
    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (
      dayjs(occursAt).isBefore(trip.startsAt) ||
      dayjs(occursAt).isAfter(trip.endsAt)
    ) {
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

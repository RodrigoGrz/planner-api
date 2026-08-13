import { Either, left, right } from '@/core/either'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { ActivitiesRepository } from '../repositories/activities-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { isTripOwner } from '../authorization/trip-access'

interface DeleteTripActivityUseCaseRequest {
  id: string
  travelerId: string
}

type DeleteTripActivityUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError,
  null
>

export class DeleteTripActivityUseCase {
  constructor(
    private activitiesRepository: ActivitiesRepository,
    private tripsRepository: TripsRepository,
  ) {}

  async execute({
    id,
    travelerId,
  }: DeleteTripActivityUseCaseRequest): Promise<DeleteTripActivityUseCaseResponse> {
    const activity = await this.activitiesRepository.findById(id)

    if (!activity) {
      return left(new ResourceNotExistsError())
    }

    const trip = await this.tripsRepository.findById(activity.tripId.toString())

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(trip, travelerId)) {
      return left(new NotAllowedError())
    }

    await this.activitiesRepository.delete(id)

    return right(null)
  }
}

import { Either, left, right } from '@/core/either'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'

interface DeleteTripUseCaseRequest {
  id: string
  userId: string
}

type DeleteTripUseCaseResponse = Either<ResourceNotExistsError, null>

export class DeleteTripUseCase {
  constructor(private tripsRepository: TripsRepository) {}

  async execute({
    id,
    userId,
  }: DeleteTripUseCaseRequest): Promise<DeleteTripUseCaseResponse> {
    const trip = await this.tripsRepository.findById(id)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (trip.ownerId.toString() !== userId) {
      return left(new NotAllowedError())
    }

    await this.tripsRepository.delete(id)

    return right(null)
  }
}

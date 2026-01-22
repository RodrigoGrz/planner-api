import { Either, left, right } from '@/core/either'
import { TripWithOwnerProps } from '../../enterprise/entities/value-objects/trip-with-owner'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'

interface GetTripDetailsUseCaseRequest {
  id: string
}

type GetTripDetailsUseCaseResponse = Either<
  ResourceNotExistsError,
  { tripWithOwner: TripWithOwnerProps }
>

export class GetTripDetailsUseCase {
  constructor(private tripsRepository: TripsRepository) {}

  async execute({
    id,
  }: GetTripDetailsUseCaseRequest): Promise<GetTripDetailsUseCaseResponse> {
    const tripWithOwner = await this.tripsRepository.findByIdWithOwner(id)

    if (!tripWithOwner) {
      return left(new ResourceNotExistsError())
    }

    return right({
      tripWithOwner,
    })
  }
}

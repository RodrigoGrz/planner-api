import { Either, left, right } from '@/core/either'
import { TripWithOwnerProps } from '../../enterprise/entities/value-objects/trip-with-owner'
import { TripsRepository } from '../repositories/trips-repository'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'

interface GetTripDetailsUseCaseRequest {
  id: string
  travelerId: string
}

type GetTripDetailsUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError,
  { tripWithOwner: TripWithOwnerProps }
>

export class GetTripDetailsUseCase {
  constructor(
    private tripsRepository: TripsRepository,
    private participantsRepository: ParticipantsRepository,
  ) {}

  async execute({
    id,
    travelerId,
  }: GetTripDetailsUseCaseRequest): Promise<GetTripDetailsUseCaseResponse> {
    const tripWithOwner = await this.tripsRepository.findByIdWithOwner(id)

    if (!tripWithOwner) {
      return left(new ResourceNotExistsError())
    }

    const isOwner = tripWithOwner.ownerId.toString() === travelerId

    if (!isOwner) {
      const participant =
        await this.participantsRepository.findByTripAndTravelerId(
          id,
          travelerId,
        )

      if (!participant) {
        return left(new NotAllowedError())
      }
    }

    return right({
      tripWithOwner,
    })
  }
}

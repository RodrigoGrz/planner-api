import { Either, left, right } from '@/core/either'
import { LinksRepository } from '../repositories/links-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { isTripOwner } from '../authorization/trip-access'

interface DeleteTripLinkUseCaseRequest {
  id: string
  travelerId: string
}

type DeleteTripLinkUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError,
  null
>

export class DeleteTripLinkUseCase {
  constructor(
    private linksRepository: LinksRepository,
    private tripsRepository: TripsRepository,
  ) {}

  async execute({
    id,
    travelerId,
  }: DeleteTripLinkUseCaseRequest): Promise<DeleteTripLinkUseCaseResponse> {
    const link = await this.linksRepository.findById(id)

    if (!link) {
      return left(new ResourceNotExistsError())
    }

    const trip = await this.tripsRepository.findById(link.tripId.toString())

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(trip, travelerId)) {
      return left(new NotAllowedError())
    }

    await this.linksRepository.delete(id)

    return right(null)
  }
}

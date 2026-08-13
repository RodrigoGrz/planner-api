import { Either, left, right } from '@/core/either'
import { LinksRepository } from '../repositories/links-repository'
import { Link } from '../../enterprise/entities/link'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TripsRepository } from '../repositories/trips-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { isTripOwner } from '../authorization/trip-access'

interface CreateTripLinkUseCaseRequest {
  title: string
  url: string
  tripId: string
  travelerId: string
}

type CreateTripLinkUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError,
  { link: Link }
>

export class CreateTripLinkUseCase {
  constructor(
    private linksRepository: LinksRepository,
    private tripsRepository: TripsRepository,
  ) {}

  async execute({
    title,
    tripId,
    travelerId,
    url,
  }: CreateTripLinkUseCaseRequest): Promise<CreateTripLinkUseCaseResponse> {
    const tripExists = await this.tripsRepository.findById(tripId)

    if (!tripExists) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(tripExists, travelerId)) {
      return left(new NotAllowedError())
    }

    const link = Link.create({
      title,
      url,
      tripId: new UniqueEntityID(tripId),
    })

    await this.linksRepository.create(link)

    return right({
      link,
    })
  }
}

import { Either, left, right } from '@/core/either'
import { LinksRepository } from '../repositories/links-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { Link } from '../../enterprise/entities/link'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { canAccessTrip } from '../authorization/trip-access'

interface GetTripLinksUseCaseRequest {
  tripId: string
  travelerId: string
}

type GetTripLinksUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError,
  { links: Link[] }
>

export class GetTripLinksUseCase {
  constructor(
    private linksRepository: LinksRepository,
    private tripsRepository: TripsRepository,
    private participantsRepository: ParticipantsRepository,
  ) {}

  async execute({
    tripId,
    travelerId,
  }: GetTripLinksUseCaseRequest): Promise<GetTripLinksUseCaseResponse> {
    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    const hasAccess = await canAccessTrip(
      trip,
      travelerId,
      this.participantsRepository,
    )

    if (!hasAccess) {
      return left(new NotAllowedError())
    }

    const links = await this.linksRepository.findAllByTripId(tripId)

    return right({
      links,
    })
  }
}

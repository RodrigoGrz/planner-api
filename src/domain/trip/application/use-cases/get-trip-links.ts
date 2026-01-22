import { Either, right } from '@/core/either'
import { LinksRepository } from '../repositories/links-repository'
import { Link } from '../../enterprise/entities/link'

interface GetTripLinksUseCaseRequest {
  tripId: string
}

type GetTripLinksUseCaseResponse = Either<null, { links: Link[] }>

export class GetTripLinksUseCase {
  constructor(private linksRepository: LinksRepository) {}

  async execute({
    tripId,
  }: GetTripLinksUseCaseRequest): Promise<GetTripLinksUseCaseResponse> {
    const links = await this.linksRepository.findAllByTripId(tripId)

    return right({
      links,
    })
  }
}

import { Either, left, right } from '@/core/either'
import { LinksRepository } from '../repositories/links-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'

interface DeleteTripLinkUseCaseRequest {
  id: string
}

type DeleteTripLinkUseCaseResponse = Either<ResourceNotExistsError, null>

export class DeleteTripLinkUseCase {
  constructor(private linksRepository: LinksRepository) {}

  async execute({
    id,
  }: DeleteTripLinkUseCaseRequest): Promise<DeleteTripLinkUseCaseResponse> {
    const linkExists = await this.linksRepository.findById(id)

    if (!linkExists) {
      return left(new ResourceNotExistsError())
    }

    await this.linksRepository.delete(id)

    return right(null)
  }
}

import { Either, left, right } from '@/core/either'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { ActivitiesRepository } from '../repositories/activities-repository'

interface DeleteTripActivityUseCaseRequest {
  id: string
}

type DeleteTripActivityUseCaseResponse = Either<ResourceNotExistsError, null>

export class DeleteTripActivityUseCase {
  constructor(private activitiesRepository: ActivitiesRepository) {}

  async execute({
    id,
  }: DeleteTripActivityUseCaseRequest): Promise<DeleteTripActivityUseCaseResponse> {
    const activityExists = await this.activitiesRepository.findById(id)

    if (!activityExists) {
      return left(new ResourceNotExistsError())
    }

    await this.activitiesRepository.delete(id)

    return right(null)
  }
}

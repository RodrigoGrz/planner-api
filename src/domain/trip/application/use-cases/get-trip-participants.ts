import { Either, right } from '@/core/either'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { Participant } from '../../enterprise/entities/participant'

interface GetTripParticipantsUseCaseRequest {
  tripId: string
}

type GetTripParticipantsUseCaseResponse = Either<
  null,
  { participants: Participant[] }
>

export class GetTripParticipantsUseCase {
  constructor(private participantsRepository: ParticipantsRepository) {}

  async execute({
    tripId,
  }: GetTripParticipantsUseCaseRequest): Promise<GetTripParticipantsUseCaseResponse> {
    const participants =
      await this.participantsRepository.findAllByTripId(tripId)

    return right({
      participants,
    })
  }
}

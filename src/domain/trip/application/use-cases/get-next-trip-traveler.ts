import { Either, right } from '@/core/either'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { ParticipantWithTripProps } from '../../enterprise/entities/value-objects/participant-with-trip'

interface GetNextTripTravelerUseCaseRequest {
  travelerId: string
}

type GetNextTripTravelerUseCaseResponse = Either<
  null,
  { nextTrip: ParticipantWithTripProps | null }
>

export class GetNextTripTravelerUseCase {
  constructor(private participantsRepository: ParticipantsRepository) {}

  async execute({
    travelerId,
  }: GetNextTripTravelerUseCaseRequest): Promise<GetNextTripTravelerUseCaseResponse> {
    const nextTrip =
      await this.participantsRepository.findNextTripByTravelerId(travelerId)

    return right({
      nextTrip,
    })
  }
}

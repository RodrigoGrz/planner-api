import { Either, left, right } from '@/core/either'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { ParticipantWithTripProps } from '../../enterprise/entities/value-objects/participant-with-trip'
import { TravelersRepository } from '../repositories/travelers-repository'

interface GetAllTravelersByTripUseCaseRequest {
  travelerId: string
}

type GetAllTravelersByTripUseCaseResponse = Either<
  ResourceNotExistsError,
  { participantsWithTrip: ParticipantWithTripProps[] }
>

export class GetAllTravelersByTripUseCase {
  constructor(
    private participantsRepository: ParticipantsRepository,
    private travelersRepository: TravelersRepository,
  ) {}

  async execute({
    travelerId,
  }: GetAllTravelersByTripUseCaseRequest): Promise<GetAllTravelersByTripUseCaseResponse> {
    const traveler = await this.travelersRepository.findById(travelerId)

    if (!traveler) {
      return left(new ResourceNotExistsError())
    }

    const participantsWithTrip =
      await this.participantsRepository.findAllByTravelerId(travelerId)

    return right({
      participantsWithTrip,
    })
  }
}

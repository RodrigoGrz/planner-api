import { Either, left, right } from '@/core/either'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { Participant } from '../../enterprise/entities/participant'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { canAccessTrip } from '../authorization/trip-access'

interface GetTripParticipantsUseCaseRequest {
  tripId: string
  travelerId: string
}

type GetTripParticipantsUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError,
  { participants: Participant[] }
>

export class GetTripParticipantsUseCase {
  constructor(
    private participantsRepository: ParticipantsRepository,
    private tripsRepository: TripsRepository,
  ) {}

  async execute({
    tripId,
    travelerId,
  }: GetTripParticipantsUseCaseRequest): Promise<GetTripParticipantsUseCaseResponse> {
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

    const participants =
      await this.participantsRepository.findAllByTripId(tripId)

    return right({
      participants,
    })
  }
}

import { Either, left, right } from '@/core/either'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { isTripOwner } from '../authorization/trip-access'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { NotAllowedError } from './errors/not-allowed-error'
import { OwnerCannotLeaveTripError } from './errors/owner-cannot-leave-trip-error'

interface RemoveTripParticipantUseCaseRequest {
  tripId: string
  participantId: string
  travelerId: string
}

type RemoveTripParticipantUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError | OwnerCannotLeaveTripError,
  null
>

export class RemoveTripParticipantUseCase {
  constructor(
    private participantsRepository: ParticipantsRepository,
    private tripsRepository: TripsRepository,
  ) {}

  async execute({
    tripId,
    participantId,
    travelerId,
  }: RemoveTripParticipantUseCaseRequest): Promise<RemoveTripParticipantUseCaseResponse> {
    const participant =
      await this.participantsRepository.findById(participantId)

    if (!participant || participant.tripId.toString() !== tripId) {
      return left(new ResourceNotExistsError())
    }

    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(trip, travelerId)) {
      return left(new NotAllowedError())
    }

    if (participant.travelerId?.toString() === travelerId) {
      return left(new OwnerCannotLeaveTripError())
    }

    await this.participantsRepository.delete(participantId)

    return right(null)
  }
}

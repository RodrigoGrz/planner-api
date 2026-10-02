import { Either, left, right } from '@/core/either'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { Participant } from '../../enterprise/entities/participant'
import { Trip } from '../../enterprise/entities/trip'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { InviteExpiredError } from './errors/invite-expired-error'
import { hasTripEnded } from '../trip-period/trip-day'

interface GetInviteByTokenUseCaseRequest {
  token: string
}

type GetInviteByTokenUseCaseResponse = Either<
  ResourceNotExistsError | InviteExpiredError,
  { participant: Participant; trip: Trip }
>

export class GetInviteByTokenUseCase {
  constructor(
    private participantsRepository: ParticipantsRepository,
    private tripsRepository: TripsRepository,
  ) {}

  async execute({
    token,
  }: GetInviteByTokenUseCaseRequest): Promise<GetInviteByTokenUseCaseResponse> {
    const participant =
      await this.participantsRepository.findByConfirmationToken(token)

    if (!participant) {
      return left(new ResourceNotExistsError())
    }

    const trip = await this.tripsRepository.findById(
      participant.tripId.toString(),
    )

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (hasTripEnded(trip.endsAt)) {
      return left(new InviteExpiredError())
    }

    return right({ participant, trip })
  }
}

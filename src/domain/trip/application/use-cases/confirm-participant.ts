import { Either, left, right } from '@/core/either'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { TravelersRepository } from '../repositories/travelers-repository'
import { Participant } from '../../enterprise/entities/participant'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'

interface ConfirmParticipantUseCaseRequest {
  token: string
}

type ConfirmParticipantUseCaseResponse = Either<
  ResourceNotExistsError,
  { participant: Participant; destination: string }
>

export class ConfirmParticipantUseCase {
  constructor(
    private participantsRepository: ParticipantsRepository,
    private tripsRepository: TripsRepository,
    private travelersRepository: TravelersRepository,
  ) {}

  async execute({
    token,
  }: ConfirmParticipantUseCaseRequest): Promise<ConfirmParticipantUseCaseResponse> {
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

    if (!participant.travelerId) {
      const traveler = await this.travelersRepository.findByEmail(
        participant.email,
      )

      if (traveler) {
        participant.linkTraveler(traveler.id, traveler.name)
      }
    }

    participant.confirm()

    await this.participantsRepository.update(participant)

    return right({
      participant,
      destination: trip.destination,
    })
  }
}

import { randomUUID } from 'node:crypto'
import { normalizeEmail } from '../../enterprise/entities/email'
import { Either, left, right } from '@/core/either'
import { Participant } from '../../enterprise/entities/participant'
import { isTripOwner } from '../authorization/trip-access'
import { Mailer } from '../mail/mailer'
import { sendParticipantInvite } from '../mail/send-participant-invite'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { TravelersRepository } from '../repositories/travelers-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { NotAllowedError } from './errors/not-allowed-error'
import { ParticipantAlreadyInvitedError } from './errors/participant-already-invited-error'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'

interface CreateInviteUseCaseRequest {
  tripId: string
  email: string
  travelerId: string
}

type CreateInviteUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError | ParticipantAlreadyInvitedError,
  { participant: Participant }
>

export class CreateInviteUseCase {
  constructor(
    private tripsRepository: TripsRepository,
    private participantsRepository: ParticipantsRepository,
    private travelersRepository: TravelersRepository,
    private mailer: Mailer,
  ) {}

  async execute({
    tripId,
    email,
    travelerId,
  }: CreateInviteUseCaseRequest): Promise<CreateInviteUseCaseResponse> {
    const trip = await this.tripsRepository.findById(tripId)

    if (!trip) {
      return left(new ResourceNotExistsError())
    }

    if (!isTripOwner(trip, travelerId)) {
      return left(new NotAllowedError())
    }

    const invitedEmail = normalizeEmail(email)

    const alreadyInvited =
      await this.participantsRepository.findByTripIdAndEmail(
        tripId,
        invitedEmail,
      )

    if (alreadyInvited) {
      return left(new ParticipantAlreadyInvitedError())
    }

    const invitedTraveler =
      await this.travelersRepository.findByEmail(invitedEmail)
    const confirmationToken = randomUUID()

    const participant = Participant.create({
      email: invitedEmail,
      name: invitedTraveler?.name ?? null,
      tripId: trip.id,
      travelerId: invitedTraveler?.id ?? null,
      isConfirmed: false,
      confirmationToken,
    })

    await this.participantsRepository.create(participant)

    await sendParticipantInvite(this.mailer, {
      trip,
      participant,
      confirmationToken,
    })

    return right({ participant })
  }
}

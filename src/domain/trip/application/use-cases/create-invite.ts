import { randomUUID } from 'node:crypto'
import { Either, left, right } from '@/core/either'
import { participantInviteFormat } from '@/utils/mail-formats'
import { Participant } from '../../enterprise/entities/participant'
import { isTripOwner } from '../authorization/trip-access'
import { Mailer } from '../mail/mailer'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { TravelersRepository } from '../repositories/travelers-repository'
import { TripsRepository } from '../repositories/trips-repository'
import { NotAllowedError } from './errors/not-allowed-error'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'

interface CreateInviteUseCaseRequest {
  tripId: string
  email: string
  travelerId: string
}

type CreateInviteUseCaseResponse = Either<
  ResourceNotExistsError | NotAllowedError,
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

    const invitedTraveler = await this.travelersRepository.findByEmail(email)
    const confirmationToken = randomUUID()

    const participant = Participant.create({
      email,
      name: invitedTraveler?.name ?? null,
      tripId: trip.id,
      travelerId: invitedTraveler?.id ?? null,
      isConfirmed: false,
      confirmationToken,
    })

    await this.participantsRepository.create(participant)

    const mailTemplate = participantInviteFormat({
      destination: trip.destination,
      startsAt: trip.startsAt,
      endsAt: trip.endsAt,
      confirmationToken,
    })

    await this.mailer.send({
      to: {
        name: participant.name,
        address: participant.email,
      },
      subject: mailTemplate.subject,
      html: mailTemplate.html,
    })

    return right({ participant })
  }
}

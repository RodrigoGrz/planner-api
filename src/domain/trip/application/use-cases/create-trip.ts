import { Either, left, right } from '@/core/either'
import { TripsRepository } from '../repositories/trips-repository'
import { InvalidTripStartDate } from './errors/invalid-trip-start-date-error'
import { InvalidTripEndDate } from './errors/invalid-trip-end-date-error'
import { Trip } from '../../enterprise/entities/trip'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { Participant } from '../../enterprise/entities/participant'
import { TravelersRepository } from '../repositories/travelers-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { Mailer } from '../mail/mailer'
import { sendParticipantInvite } from '../mail/send-participant-invite'
import { InvalidTripDuration } from './errors/invalid-trip-duration-error'
import { randomUUID } from 'node:crypto'
import { validateTripPeriod } from '../trip-period/validate-trip-period'
import { normalizeTripDate } from '../trip-period/trip-day'
import { normalizeEmail } from '../../enterprise/entities/email'

interface CreateTripUseCaseRequest {
  destination: string
  startsAt: Date
  endsAt: Date
  ownerId: string
  emailsToInvite: string[]
}

type CreateTripUseCaseResponse = Either<
  | InvalidTripStartDate
  | InvalidTripEndDate
  | InvalidTripDuration
  | ResourceNotExistsError,
  { trip: Trip }
>

export class CreateTripUseCase {
  constructor(
    private tripsRepository: TripsRepository,
    private travelersRepository: TravelersRepository,
    private participantsRepository: ParticipantsRepository,
    private mailer: Mailer,
  ) {}

  async execute({
    destination,
    startsAt,
    endsAt,
    ownerId,
    emailsToInvite,
  }: CreateTripUseCaseRequest): Promise<CreateTripUseCaseResponse> {
    const periodValidation = validateTripPeriod({ startsAt, endsAt })

    if (periodValidation.isLeft()) {
      return left(periodValidation.value)
    }

    const owner = await this.travelersRepository.findById(ownerId)

    if (!owner) {
      return left(new ResourceNotExistsError())
    }

    const filteredEmails = [
      ...new Set(
        emailsToInvite
          .map(normalizeEmail)
          .filter((email) => email !== owner.email),
      ),
    ]

    const travelers =
      filteredEmails.length > 0
        ? await this.travelersRepository.findManyByEmails(filteredEmails)
        : []

    const travelerMap = new Map(travelers.map((t) => [t.email, t]))

    const trip = Trip.create({
      destination,
      ownerId: new UniqueEntityID(ownerId),
      startsAt: normalizeTripDate(startsAt),
      endsAt: normalizeTripDate(endsAt),
    })

    const participantOwner = Participant.create({
      email: owner.email,
      name: owner.name,
      isConfirmed: true,
      tripId: trip.id,
      travelerId: new UniqueEntityID(ownerId),
    })

    const invites = filteredEmails.map((email) => {
      const traveler = travelerMap.get(email)
      const confirmationToken = randomUUID()

      return {
        confirmationToken,
        participant: Participant.create({
          email,
          name: traveler?.name ?? null,
          tripId: trip.id,
          travelerId: traveler ? traveler.id : undefined,
          isConfirmed: false,
          confirmationToken,
        }),
      }
    })

    await this.tripsRepository.runInTransaction(async () => {
      await this.tripsRepository.create(trip)
      await this.participantsRepository.create(participantOwner)

      for (const { participant } of invites) {
        await this.participantsRepository.create(participant)
      }
    })

    for (const { participant, confirmationToken } of invites) {
      await sendParticipantInvite(this.mailer, {
        trip,
        participant,
        confirmationToken,
      })
    }

    return right({
      trip,
    })
  }
}

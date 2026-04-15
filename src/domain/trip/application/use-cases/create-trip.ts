import { Either, left, right } from '@/core/either'
import { TripsRepository } from '../repositories/trips-repository'
import dayjs from 'dayjs'
import { InvalidTripStartDate } from './errors/invalid-trip-start-date-error'
import { InvalidTripEndDate } from './errors/invalid-trip-end-date-error'
import { Trip } from '../../enterprise/entities/trip'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { Participant } from '../../enterprise/entities/participant'
import { TravelersRepository } from '../repositories/travelers-repository'
import { ResourceNotExistsError } from './errors/resource-not-exists-error'
import { Mailer } from '../mail/mailer'
import { createTripFormat } from '@/utils/mail-formats'

interface CreateTripUseCaseRequest {
  destination: string
  startsAt: Date
  endsAt: Date
  ownerId: string
  emailsToInvite: string[]
}

type CreateTripUseCaseResponse = Either<
  InvalidTripStartDate | InvalidTripEndDate | ResourceNotExistsError,
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
    if (dayjs(startsAt).isBefore(new Date())) {
      return left(new InvalidTripStartDate())
    }

    if (dayjs(endsAt).isBefore(startsAt)) {
      return left(new InvalidTripEndDate())
    }

    const owner = await this.travelersRepository.findById(ownerId)

    if (!owner) {
      return left(new ResourceNotExistsError())
    }

    const filteredEmails = [
      ...new Set(emailsToInvite.filter((email) => email !== owner.email)),
    ]

    const travelers =
      filteredEmails.length > 0
        ? await this.travelersRepository.findManyByEmails(filteredEmails)
        : []

    const travelerMap = new Map(travelers.map((t) => [t.email, t]))

    const trip = Trip.create({
      destination,
      ownerId: new UniqueEntityID(ownerId),
      startsAt,
      endsAt,
    })

    const participantOwner = Participant.create({
      email: owner.email,
      name: owner.name,
      isConfirmed: true,
      tripId: trip.id,
      travelerId: new UniqueEntityID(ownerId),
    })

    const inviteParticipants: Participant[] = filteredEmails.map((email) => {
      const traveler = travelerMap.get(email)

      return Participant.create({
        email,
        name: traveler?.name ?? null,
        tripId: trip.id,
        travelerId: traveler ? traveler.id : undefined,
        isConfirmed: false,
      })
    })

    await this.tripsRepository.runInTransaction(async () => {
      await this.tripsRepository.create(trip)
      await this.participantsRepository.create(participantOwner)

      for (const participant of inviteParticipants) {
        await this.participantsRepository.create(participant)
      }
    })

    if (inviteParticipants.length > 0) {
      const mailTemplate = createTripFormat({
        destination,
        startsAt,
        endsAt,
        tripId: trip.id.toString(),
      })

      for (const participant of inviteParticipants) {
        await this.mailer.send({
          html: mailTemplate.html,
          subject: mailTemplate.subject,
          to: {
            name: participant.name,
            address: participant.email,
          },
        })
      }
    }

    return right({
      trip,
    })
  }
}

import { Either, right } from '@/core/either'
import { ParticipantsRepository } from '../repositories/participants-repository'
import { ParticipantWithTripProps } from '../../enterprise/entities/value-objects/participant-with-trip'
import { hasTripEnded } from '../trip-period/trip-day'

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
    const trips =
      await this.participantsRepository.findAllByTravelerId(travelerId)

    const nextTrip =
      trips
        .filter((trip) => !hasTripEnded(trip.endsAt))
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] ?? null

    return right({
      nextTrip,
    })
  }
}

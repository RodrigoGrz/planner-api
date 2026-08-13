import { Trip } from '../../enterprise/entities/trip'
import { ParticipantsRepository } from '../repositories/participants-repository'

export function isTripOwner(trip: Trip, travelerId: string) {
  return trip.ownerId.toString() === travelerId
}

export async function canAccessTrip(
  trip: Trip,
  travelerId: string,
  participantsRepository: ParticipantsRepository,
) {
  if (isTripOwner(trip, travelerId)) {
    return true
  }

  const participant = await participantsRepository.findByTripAndTravelerId(
    trip.id.toString(),
    travelerId,
  )

  return participant !== null
}

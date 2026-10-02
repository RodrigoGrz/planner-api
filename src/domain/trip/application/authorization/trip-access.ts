import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Trip } from '../../enterprise/entities/trip'
import { TripWithOwnerProps } from '../../enterprise/entities/value-objects/trip-with-owner'
import { ParticipantsRepository } from '../repositories/participants-repository'

export function isTripOwner(
  trip: { ownerId: UniqueEntityID },
  travelerId: string,
) {
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

  return participant?.isConfirmed === true
}

export async function canViewTripSummary(
  trip: TripWithOwnerProps,
  travelerId: string,
  participantsRepository: ParticipantsRepository,
) {
  if (isTripOwner(trip, travelerId)) {
    return true
  }

  const participant = await participantsRepository.findByTripAndTravelerId(
    trip.tripId.toString(),
    travelerId,
  )

  return participant !== null
}

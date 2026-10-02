import { UseCaseError } from '@/core/errors/use-case-error'
import { MAX_TRIP_DURATION_IN_DAYS } from '../../trip-period/trip-duration'

export class InvalidTripDuration extends Error implements UseCaseError {
  constructor() {
    super(
      `A duração da viagem deve ter no máximo ${MAX_TRIP_DURATION_IN_DAYS} dias.`,
    )
  }
}

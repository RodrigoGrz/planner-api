import { Either, left, right } from '@/core/either'
import { dayjs } from '@/lib/dayjs'
import { InvalidTripStartDate } from '../use-cases/errors/invalid-trip-start-date-error'
import { InvalidTripEndDate } from '../use-cases/errors/invalid-trip-end-date-error'
import { InvalidTripDuration } from '../use-cases/errors/invalid-trip-duration-error'
import { exceedsMaxTripDuration } from './trip-duration'

interface TripPeriod {
  startsAt: Date
  endsAt: Date
}

interface ValidateTripPeriodParams extends TripPeriod {
  currentPeriod?: TripPeriod
}

type ValidateTripPeriodResult = Either<
  InvalidTripStartDate | InvalidTripEndDate | InvalidTripDuration,
  null
>

export function validateTripPeriod({
  startsAt,
  endsAt,
  currentPeriod,
}: ValidateTripPeriodParams): ValidateTripPeriodResult {
  const today = dayjs().startOf('day')
  const start = dayjs(startsAt).startOf('day')
  const end = dayjs(endsAt).startOf('day')

  const startChanged =
    !currentPeriod || !start.isSame(currentPeriod.startsAt, 'day')
  const endChanged = !currentPeriod || !end.isSame(currentPeriod.endsAt, 'day')

  if (!startChanged && !endChanged) {
    return right(null)
  }

  if (startChanged && start.isBefore(today)) {
    return left(new InvalidTripStartDate())
  }

  if (endChanged && end.isBefore(today)) {
    return left(new InvalidTripEndDate())
  }

  if (end.isBefore(start)) {
    return left(new InvalidTripEndDate())
  }

  if (exceedsMaxTripDuration(startsAt, endsAt)) {
    return left(new InvalidTripDuration())
  }

  return right(null)
}

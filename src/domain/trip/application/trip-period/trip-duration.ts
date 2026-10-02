import { toTripDay } from './trip-day'

export const MAX_TRIP_DURATION_IN_DAYS = 30

export function getTripDurationInDays(startsAt: Date, endsAt: Date) {
  return toTripDay(endsAt).diff(toTripDay(startsAt), 'day')
}

export function exceedsMaxTripDuration(startsAt: Date, endsAt: Date) {
  return getTripDurationInDays(startsAt, endsAt) > MAX_TRIP_DURATION_IN_DAYS
}

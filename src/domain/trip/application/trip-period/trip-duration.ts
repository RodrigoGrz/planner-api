import { dayjs } from '@/lib/dayjs'

export const MAX_TRIP_DURATION_IN_DAYS = 30

export function getTripDurationInDays(startsAt: Date, endsAt: Date) {
  return dayjs(endsAt)
    .startOf('day')
    .diff(dayjs(startsAt).startOf('day'), 'days')
}

export function exceedsMaxTripDuration(startsAt: Date, endsAt: Date) {
  return getTripDurationInDays(startsAt, endsAt) > MAX_TRIP_DURATION_IN_DAYS
}

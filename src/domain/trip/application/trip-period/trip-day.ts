import { dayjs } from '@/lib/dayjs'

export function toTripDay(date: Date) {
  return dayjs.utc(date).startOf('day')
}

export function normalizeTripDate(date: Date) {
  return toTripDay(date).toDate()
}

export function getTodayTripDay() {
  return dayjs.utc().startOf('day')
}

export function getTripPeriodBounds(startsAt: Date, endsAt: Date) {
  return {
    firstMoment: toTripDay(startsAt).toDate(),
    lastMoment: toTripDay(endsAt).endOf('day').toDate(),
  }
}

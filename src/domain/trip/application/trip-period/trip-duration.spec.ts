import { dayjs } from '@/lib/dayjs'
import {
  MAX_TRIP_DURATION_IN_DAYS,
  exceedsMaxTripDuration,
  getTripDurationInDays,
} from './trip-duration'

describe('Trip duration', () => {
  const startsAt = new Date('2026-03-10T12:00:00')

  it('should count the days between the start and the end of the trip', () => {
    const endsAt = dayjs(startsAt).add(4, 'day').toDate()

    expect(getTripDurationInDays(startsAt, endsAt)).toBe(4)
  })

  it('should ignore the time of day when counting the duration', () => {
    const lateStart = new Date('2026-03-10T23:00:00')
    const earlyEnd = new Date('2026-03-11T01:00:00')

    expect(getTripDurationInDays(lateStart, earlyEnd)).toBe(1)
  })

  it('should not exceed the maximum duration with exactly 30 days', () => {
    const endsAt = dayjs(startsAt)
      .add(MAX_TRIP_DURATION_IN_DAYS, 'day')
      .toDate()

    expect(exceedsMaxTripDuration(startsAt, endsAt)).toBe(false)
  })

  it('should exceed the maximum duration with 31 days', () => {
    const endsAt = dayjs(startsAt)
      .add(MAX_TRIP_DURATION_IN_DAYS + 1, 'day')
      .toDate()

    expect(exceedsMaxTripDuration(startsAt, endsAt)).toBe(true)
  })
})

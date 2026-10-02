import { dayjs } from '@/lib/dayjs'
import { InvalidTripStartDate } from '../use-cases/errors/invalid-trip-start-date-error'
import { InvalidTripEndDate } from '../use-cases/errors/invalid-trip-end-date-error'
import { InvalidTripDuration } from '../use-cases/errors/invalid-trip-duration-error'
import { MAX_TRIP_DURATION_IN_DAYS } from './trip-duration'
import { validateTripPeriod } from './validate-trip-period'

describe('Validate trip period', () => {
  describe('in UTC calendar days', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('should compare the start date against the current UTC day', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-03-10T01:00:00.000Z'))

      const result = validateTripPeriod({
        startsAt: new Date('2026-03-09T12:00:00.000Z'),
        endsAt: new Date('2026-03-12T00:00:00.000Z'),
      })

      expect(result.value).toBeInstanceOf(InvalidTripStartDate)
    })

    it('should count the duration in UTC days', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'))

      const result = validateTripPeriod({
        startsAt: new Date('2026-03-10T01:00:00.000Z'),
        endsAt: new Date('2026-04-09T23:00:00.000Z'),
      })

      expect(result.isRight()).toBe(true)
    })
  })

  describe('without a current period', () => {
    it('should accept a trip starting today', () => {
      const result = validateTripPeriod({
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(3, 'day').toDate(),
      })

      expect(result.isRight()).toBe(true)
    })

    it('should reject a start date before today', () => {
      const result = validateTripPeriod({
        startsAt: dayjs().subtract(1, 'day').toDate(),
        endsAt: dayjs().add(3, 'day').toDate(),
      })

      expect(result.value).toBeInstanceOf(InvalidTripStartDate)
    })

    it('should reject an end date before the start date', () => {
      const result = validateTripPeriod({
        startsAt: dayjs().add(5, 'day').toDate(),
        endsAt: dayjs().add(3, 'day').toDate(),
      })

      expect(result.value).toBeInstanceOf(InvalidTripEndDate)
    })

    it('should reject a period longer than the maximum duration', () => {
      const startsAt = dayjs().add(1, 'month')

      const result = validateTripPeriod({
        startsAt: startsAt.toDate(),
        endsAt: startsAt.add(MAX_TRIP_DURATION_IN_DAYS + 1, 'day').toDate(),
      })

      expect(result.value).toBeInstanceOf(InvalidTripDuration)
    })
  })

  describe('with a current period', () => {
    const ongoingPeriod = {
      startsAt: dayjs().subtract(2, 'day').toDate(),
      endsAt: dayjs().add(2, 'day').toDate(),
    }

    it('should accept an unchanged period that started in the past', () => {
      const result = validateTripPeriod({
        ...ongoingPeriod,
        currentPeriod: ongoingPeriod,
      })

      expect(result.isRight()).toBe(true)
    })

    it('should accept an unchanged period longer than the maximum duration', () => {
      const legacyPeriod = {
        startsAt: dayjs().subtract(1, 'day').toDate(),
        endsAt: dayjs()
          .add(MAX_TRIP_DURATION_IN_DAYS + 10, 'day')
          .toDate(),
      }

      const result = validateTripPeriod({
        ...legacyPeriod,
        currentPeriod: legacyPeriod,
      })

      expect(result.isRight()).toBe(true)
    })

    it('should treat a different time on the same day as unchanged', () => {
      const result = validateTripPeriod({
        startsAt: dayjs.utc(ongoingPeriod.startsAt).startOf('day').toDate(),
        endsAt: dayjs.utc(ongoingPeriod.endsAt).endOf('day').toDate(),
        currentPeriod: ongoingPeriod,
      })

      expect(result.isRight()).toBe(true)
    })

    it('should reject moving the start date to the past', () => {
      const result = validateTripPeriod({
        startsAt: dayjs().subtract(3, 'day').toDate(),
        endsAt: ongoingPeriod.endsAt,
        currentPeriod: ongoingPeriod,
      })

      expect(result.value).toBeInstanceOf(InvalidTripStartDate)
    })

    it('should accept extending the end date of an ongoing trip', () => {
      const result = validateTripPeriod({
        startsAt: ongoingPeriod.startsAt,
        endsAt: dayjs().add(10, 'day').toDate(),
        currentPeriod: ongoingPeriod,
      })

      expect(result.isRight()).toBe(true)
    })

    it('should accept ending an ongoing trip today', () => {
      const result = validateTripPeriod({
        startsAt: ongoingPeriod.startsAt,
        endsAt: dayjs().toDate(),
        currentPeriod: ongoingPeriod,
      })

      expect(result.isRight()).toBe(true)
    })

    it('should reject ending an ongoing trip before today', () => {
      const result = validateTripPeriod({
        startsAt: ongoingPeriod.startsAt,
        endsAt: dayjs().subtract(1, 'day').toDate(),
        currentPeriod: ongoingPeriod,
      })

      expect(result.value).toBeInstanceOf(InvalidTripEndDate)
    })

    it('should reject an extended ongoing trip longer than the maximum duration', () => {
      const result = validateTripPeriod({
        startsAt: ongoingPeriod.startsAt,
        endsAt: dayjs(ongoingPeriod.startsAt)
          .add(MAX_TRIP_DURATION_IN_DAYS + 1, 'day')
          .toDate(),
        currentPeriod: ongoingPeriod,
      })

      expect(result.value).toBeInstanceOf(InvalidTripDuration)
    })
  })
})

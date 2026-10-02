import {
  getTodayTripDay,
  getTripPeriodBounds,
  hasTripEnded,
  normalizeTripDate,
  toTripDay,
} from './trip-day'

describe('Trip day', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should take the UTC calendar day of a date', () => {
    const day = toTripDay(new Date('2026-03-10T01:00:00.000Z'))

    expect(day.toISOString()).toBe('2026-03-10T00:00:00.000Z')
  })

  it('should normalize a trip date to midnight UTC', () => {
    expect(normalizeTripDate(new Date('2026-03-10T23:30:00.000Z'))).toEqual(
      new Date('2026-03-10T00:00:00.000Z'),
    )
  })

  it('should cover the whole last day in the trip period bounds', () => {
    const bounds = getTripPeriodBounds(
      new Date('2026-03-10T15:00:00.000Z'),
      new Date('2026-03-14T00:00:00.000Z'),
    )

    expect(bounds).toEqual({
      firstMoment: new Date('2026-03-10T00:00:00.000Z'),
      lastMoment: new Date('2026-03-14T23:59:59.999Z'),
    })
  })

  it('should not consider the trip ended during its last day', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-14T23:59:00.000Z'))

    expect(hasTripEnded(new Date('2026-03-14T00:00:00.000Z'))).toBe(false)
  })

  it('should consider the trip ended after its last day', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-15T00:00:00.000Z'))

    expect(hasTripEnded(new Date('2026-03-14T00:00:00.000Z'))).toBe(true)
  })

  it('should use the current UTC day as today', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-10T01:00:00.000Z'))

    expect(getTodayTripDay().toISOString()).toBe('2026-03-10T00:00:00.000Z')
  })
})

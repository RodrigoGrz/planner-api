import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { dayjs } from '@/lib/dayjs'
import { Trip } from './trip'

function makeTripProps() {
  return {
    destination: 'Norway',
    startsAt: dayjs().add(1, 'month').toDate(),
    endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
    ownerId: new UniqueEntityID(),
  }
}

describe('Trip', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should keep the given createdAt when recreating a trip', () => {
    const createdAt = new Date('2020-01-01T10:00:00.000Z')

    const trip = Trip.create({ ...makeTripProps(), createdAt })

    expect(trip.createdAt).toEqual(createdAt)
  })

  it('should set createdAt to now when none is given', () => {
    const now = new Date('2026-05-10T12:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const trip = Trip.create(makeTripProps())

    expect(trip.createdAt).toEqual(now)
  })

  it('should not change createdAt when a property is updated', () => {
    const createdAt = new Date('2020-01-01T10:00:00.000Z')
    const now = new Date('2026-05-10T12:00:00.000Z')

    const trip = Trip.create({ ...makeTripProps(), createdAt })

    vi.useFakeTimers()
    vi.setSystemTime(now)

    trip.destination = 'London'

    expect(trip.createdAt).toEqual(createdAt)
    expect(trip.updatedAt).toEqual(now)
  })
})

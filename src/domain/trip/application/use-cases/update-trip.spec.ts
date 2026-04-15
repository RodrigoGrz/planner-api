import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { UpdateTripUseCase } from './update-trip'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { dayjs } from '@/lib/dayjs'
import { Activity } from '../../enterprise/entities/activity'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'

let activitiesRepository: FakeActivitiesRepository
let tripsRepository: FakeTripsRepository
let travelersRepository: FakeTravelersRepository
let linksRepository: FakeLinksRepository
let updateTripUseCase: UpdateTripUseCase

describe('Update Trip', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    updateTripUseCase = new UpdateTripUseCase(
      tripsRepository,
      activitiesRepository,
    )
  })
  it('should be able to update a trip', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(4, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const result = await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      destination: 'London',
      startsAt: dayjs().add(2, 'month').toDate(),
      endsAt: dayjs().add(2, 'month').add(4, 'day').toDate(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.trip.destination).toBe('London')
  })

  it('should delete only activities outside the new trip period', async () => {
    const owner = await makeTraveler()
    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      destination: 'Norway',
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(5, 'day').toDate(),
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)

    const newStartsAt = dayjs().add(2, 'month').toDate()
    const newEndsAt = dayjs().add(2, 'month').add(3, 'day').toDate()

    const activityBefore = Activity.create({
      tripId: trip.id,
      occursAt: dayjs(newStartsAt).subtract(1, 'day').toDate(),
      title: 'Before trip',
    })

    const activityInside = Activity.create({
      tripId: trip.id,
      occursAt: dayjs(newStartsAt).add(1, 'day').toDate(),
      title: 'Inside trip',
    })

    const activityAfter = Activity.create({
      tripId: trip.id,
      occursAt: dayjs(newEndsAt).add(1, 'day').toDate(),
      title: 'After trip',
    })

    activitiesRepository.items.push(
      activityBefore,
      activityInside,
      activityAfter,
    )

    const result = await updateTripUseCase.execute({
      tripId: trip.id.toString(),
      destination: 'London',
      startsAt: newStartsAt,
      endsAt: newEndsAt,
    })

    expect(result.isRight()).toBeTruthy()
    expect(activitiesRepository.items).toHaveLength(1)
    expect(activitiesRepository.items[0].id).toEqual(activityInside.id)
  })
})

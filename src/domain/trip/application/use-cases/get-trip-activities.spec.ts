import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { GetTripActivitiesUseCase } from './get-trip-activities'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { makeActivity } from 'tests/factories/make-activity'
import dayjs from 'dayjs'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'

let activitiesRepository: FakeActivitiesRepository
let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let linksRepository: FakeLinksRepository
let getTripActivitiesUseCase: GetTripActivitiesUseCase

describe('Get Trip Activities', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    getTripActivitiesUseCase = new GetTripActivitiesUseCase(tripsRepository)
  })

  it('should be able to get activities from a trip', async () => {
    const owner = await makeTraveler()

    travelersRepository.items.push(owner)

    const trip = await makeTrip({
      startsAt: dayjs().add(1, 'month').toDate(),
      endsAt: dayjs().add(1, 'month').add(3, 'day').toDate(),
      ownerId: owner.id,
    })

    const trip2 = await makeTrip({
      ownerId: owner.id,
    })

    tripsRepository.items.push(trip)
    tripsRepository.items.push(trip2)

    const activity1 = await makeActivity({
      tripId: trip.id,
      occursAt: dayjs().add(1, 'month').toDate(),
    })

    const activity2 = await makeActivity({
      tripId: trip.id,
      occursAt: dayjs().add(1, 'month').toDate(),
    })

    const activity3 = await makeActivity({
      tripId: trip.id,
      occursAt: dayjs().add(1, 'month').add(1, 'day').toDate(),
    })

    const activity4 = await makeActivity({
      tripId: trip2.id,
      occursAt: dayjs().add(2, 'month').add(1, 'day').toDate(),
    })

    activitiesRepository.items.push(activity1)
    activitiesRepository.items.push(activity2)
    activitiesRepository.items.push(activity3)
    activitiesRepository.items.push(activity4)

    const result = await getTripActivitiesUseCase.execute({
      tripId: trip.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.activities).length(4)
    expect(result.isRight() && result.value.activities[0].activities).length(2)
    expect(result.isRight() && result.value.activities[1].activities).length(1)
    expect(result.isRight() && result.value.activities[2].activities).length(0)
  })
})

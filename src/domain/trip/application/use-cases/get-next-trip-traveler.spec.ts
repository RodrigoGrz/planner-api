import { FakeParticipantsRepository } from 'tests/repositories/fake-participants-repository'
import { GetNextTripTravelerUseCase } from './get-next-trip-traveler'
import { FakeTripsRepository } from 'tests/repositories/fake-trips-repository'
import { FakeTravelersRepository } from 'tests/repositories/fake-travelers-repository'
import { FakeActivitiesRepository } from 'tests/repositories/fake-activities-repository'
import { makeTraveler } from 'tests/factories/make-traveler'
import { makeTrip } from 'tests/factories/make-trip'
import { makeParticipant } from 'tests/factories/make-participant'
import { dayjs } from '@/lib/dayjs'
import { FakeLinksRepository } from 'tests/repositories/fake-links-repository'

let activitiesRepository: FakeActivitiesRepository
let travelersRepository: FakeTravelersRepository
let tripsRepository: FakeTripsRepository
let participantsRepository: FakeParticipantsRepository
let linksRepository: FakeLinksRepository
let getNextTripTravelerUseCase: GetNextTripTravelerUseCase

describe('Get Next Trip Traveler', () => {
  beforeEach(() => {
    activitiesRepository = new FakeActivitiesRepository()
    travelersRepository = new FakeTravelersRepository()
    linksRepository = new FakeLinksRepository()
    tripsRepository = new FakeTripsRepository(
      travelersRepository,
      activitiesRepository,
      linksRepository,
    )
    participantsRepository = new FakeParticipantsRepository(tripsRepository)
    getNextTripTravelerUseCase = new GetNextTripTravelerUseCase(
      participantsRepository,
    )
  })

  it('should be able to get next trip traveler', async () => {
    const traveler = await makeTraveler()
    const traveler2 = await makeTraveler()

    travelersRepository.items.push(traveler)
    travelersRepository.items.push(traveler2)

    const trip = await makeTrip({
      ownerId: traveler.id,
      destination: 'Miami',
      startsAt: dayjs().add(6, 'month').toDate(),
      endsAt: dayjs().add(6, 'month').add(3, 'day').toDate(),
    })

    const trip2 = await makeTrip({
      ownerId: traveler2.id,
      destination: 'London',
      startsAt: dayjs().add(7, 'month').toDate(),
      endsAt: dayjs().add(7, 'month').add(3, 'day').toDate(),
    })

    const trip3 = await makeTrip({
      ownerId: traveler.id,
      destination: 'Norway',
      startsAt: dayjs().add(3, 'month').toDate(),
      endsAt: dayjs().add(3, 'month').add(3, 'day').toDate(),
    })

    const trip4 = await makeTrip({
      ownerId: traveler.id,
      destination: 'Carribean',
      startsAt: dayjs().add(2, 'month').toDate(),
      endsAt: dayjs().add(2, 'month').add(3, 'day').toDate(),
    })

    tripsRepository.items.push(trip)
    tripsRepository.items.push(trip2)
    tripsRepository.items.push(trip3)
    tripsRepository.items.push(trip4)

    const participant = await makeParticipant({
      travelerId: traveler.id,
      tripId: trip.id,
    })

    const participant2 = await makeParticipant({
      travelerId: traveler2.id,
      tripId: trip2.id,
    })

    const participant3 = await makeParticipant({
      travelerId: traveler.id,
      tripId: trip3.id,
    })

    const participant4 = await makeParticipant({
      travelerId: traveler.id,
      tripId: trip4.id,
    })

    const participant5 = await makeParticipant({
      travelerId: null,
      tripId: trip4.id,
    })

    const participant6 = await makeParticipant({
      travelerId: null,
      tripId: trip2.id,
    })

    participantsRepository.items.push(participant)
    participantsRepository.items.push(participant2)
    participantsRepository.items.push(participant3)
    participantsRepository.items.push(participant4)
    participantsRepository.items.push(participant5)
    participantsRepository.items.push(participant6)

    const result = await getNextTripTravelerUseCase.execute({
      travelerId: traveler.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(participantsRepository.items.length).toBe(6)
    expect(tripsRepository.items.length).toBe(4)
    expect(result.isRight() && result.value.nextTrip?.destination).toBe(
      'Carribean',
    )
  })

  it('should return null when the traveler has no upcoming trip', async () => {
    const traveler = await makeTraveler()

    travelersRepository.items.push(traveler)

    const pastTrip = await makeTrip({
      ownerId: traveler.id,
      destination: 'Lisbon',
      startsAt: dayjs().subtract(2, 'month').toDate(),
      endsAt: dayjs().subtract(2, 'month').add(3, 'day').toDate(),
    })

    tripsRepository.items.push(pastTrip)

    const participant = await makeParticipant({
      travelerId: traveler.id,
      tripId: pastTrip.id,
    })

    participantsRepository.items.push(participant)

    const result = await getNextTripTravelerUseCase.execute({
      travelerId: traveler.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.isRight() && result.value.nextTrip).toBeUndefined()
  })
})

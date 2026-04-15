import { ParticipantsRepository } from '@/domain/trip/application/repositories/participants-repository'
import { Participant } from '@/domain/trip/enterprise/entities/participant'
import {
  ParticipantWithTrip,
  ParticipantWithTripProps,
} from '@/domain/trip/enterprise/entities/value-objects/participant-with-trip'
import { FakeTripsRepository } from './fake-trips-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { dayjs } from '@/lib/dayjs'

export class FakeParticipantsRepository implements ParticipantsRepository {
  public items: Participant[] = []

  constructor(private tripsRepository: FakeTripsRepository) {}

  async create(participant: Participant): Promise<void> {
    const exists = this.items.find(
      (p) =>
        p.tripId.toString() === participant.tripId.toString() &&
        p.email === participant.email,
    )

    if (exists) return

    this.items.push(participant)
  }

  async findAllByTripId(tripId: string): Promise<Participant[]> {
    return this.items.filter((item) => item.tripId.toString() === tripId)
  }

  async findAllByTravelerId(
    travelerId: string,
  ): Promise<ParticipantWithTripProps[]> {
    const participants = this.items.filter(
      (item) => item.travelerId?.toString() === travelerId,
    )

    return participants
      .filter(
        (
          participant,
        ): participant is Participant & { travelerId: UniqueEntityID } =>
          participant.travelerId != null,
      )
      .map((participant) => {
        const trip = this.tripsRepository.items.find(
          (t) => t.id.toString() === participant.tripId.toString(),
        )

        return ParticipantWithTrip.create({
          name: participant.name,
          email: participant.email,
          participantId: participant.id,
          isConfirmed: participant.isConfirmed,
          destination: trip!.destination,
          startsAt: trip!.startsAt,
          endsAt: trip!.endsAt,
          tripId: trip!.id,
        })
      })
  }

  async findNextTripByTravelerId(
    travelerId: string,
  ): Promise<ParticipantWithTripProps | null> {
    const participants = this.items.filter(
      (item) => item.travelerId?.toString() === travelerId,
    )

    const trips = participants
      .filter(
        (
          participant,
        ): participant is Participant & { travelerId: UniqueEntityID } =>
          participant.travelerId != null,
      )
      .map((participant) => {
        const trip = this.tripsRepository.items.find(
          (t) => t.id.toString() === participant.tripId.toString(),
        )

        return ParticipantWithTrip.create({
          name: participant.name,
          email: participant.email,
          participantId: participant.id,
          isConfirmed: participant.isConfirmed,
          destination: trip!.destination,
          startsAt: trip!.startsAt,
          endsAt: trip!.endsAt,
          tripId: trip!.id,
        })
      })

    const now = dayjs()

    return trips
      .filter((trip) => dayjs(trip.startsAt).isAfter(now, 'day'))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0]
  }

  deleteByTripId(tripId: string): void {
    this.items = this.items.filter((item) => item.tripId.toString() !== tripId)
  }
}

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

export interface ParticipantWithTripProps {
  participantId: UniqueEntityID
  tripId: UniqueEntityID
  name?: string | null
  email: string
  coverImageUrl?: string | null
  isConfirmed: boolean
  destination: string
  startsAt: Date
  endsAt: Date
}

export class ParticipantWithTrip extends ValueObject<ParticipantWithTripProps> {
  get participantId() {
    return this.props.participantId
  }

  get tripId() {
    return this.props.tripId
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get coverImageUrl() {
    return this.props.coverImageUrl
  }

  get isConfirmed() {
    return this.props.isConfirmed
  }

  get destination() {
    return this.props.destination
  }

  get startsAt() {
    return this.props.startsAt
  }

  get endsAt() {
    return this.props.endsAt
  }

  static create(props: ParticipantWithTripProps) {
    return new ParticipantWithTrip(props)
  }
}

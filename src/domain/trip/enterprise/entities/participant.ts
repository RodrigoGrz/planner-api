import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface ParticipantProps {
  name?: string | null
  email: string
  travelerId?: UniqueEntityID | null
  tripId: UniqueEntityID
  isConfirmed: boolean
}

export class Participant extends Entity<ParticipantProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get travelerId() {
    return this.props.travelerId
  }

  get tripId() {
    return this.props.tripId
  }

  get isConfirmed() {
    return this.props.isConfirmed
  }

  static create(props: ParticipantProps, id?: UniqueEntityID) {
    const participant = new Participant(props, id)

    return participant
  }
}

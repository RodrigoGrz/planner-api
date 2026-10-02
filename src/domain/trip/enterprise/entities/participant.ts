import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { normalizeEmail } from './email'

export interface ParticipantProps {
  name?: string | null
  email: string
  travelerId?: UniqueEntityID | null
  tripId: UniqueEntityID
  isConfirmed: boolean
  confirmationToken?: string | null
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

  get confirmationToken() {
    return this.props.confirmationToken
  }

  linkTraveler(travelerId: UniqueEntityID, name: string) {
    if (this.props.travelerId) {
      return
    }

    this.props.travelerId = travelerId
    this.props.name = name
  }

  confirm() {
    this.props.isConfirmed = true
    this.props.confirmationToken = null
  }

  static create(props: ParticipantProps, id?: UniqueEntityID) {
    const participant = new Participant(
      { ...props, email: normalizeEmail(props.email) },
      id,
    )

    return participant
  }
}

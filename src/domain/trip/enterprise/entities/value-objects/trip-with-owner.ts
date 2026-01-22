import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

export interface TripWithOwnerProps {
  tripId: UniqueEntityID
  destination: string
  startsAt: Date
  endsAt: Date
  ownerName: string
  createdAt: Date
  updatedAt?: Date | null
}

export class TripWithOwner extends ValueObject<TripWithOwnerProps> {
  get tripId() {
    return this.props.tripId
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

  get ownerName() {
    return this.props.ownerName
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: TripWithOwnerProps) {
    return new TripWithOwner(props)
  }
}

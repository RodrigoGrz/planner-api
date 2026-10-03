import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

export interface TripWithOwnerProps {
  tripId: UniqueEntityID
  destination: string
  startsAt: Date
  endsAt: Date
  ownerId: UniqueEntityID
  ownerName: string
  createdAt: Date
  updatedAt?: Date | null
  version: number
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

  get ownerId() {
    return this.props.ownerId
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

  get version() {
    return this.props.version
  }

  static create(props: TripWithOwnerProps) {
    return new TripWithOwner(props)
  }
}

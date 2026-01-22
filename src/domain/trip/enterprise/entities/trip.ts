import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface TripProps {
  destination: string
  startsAt: Date
  endsAt: Date
  ownerId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class Trip extends Entity<TripProps> {
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

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set destination(destination: string) {
    this.props.destination = destination
    this.touch()
  }

  set startsAt(startsAt: Date) {
    this.props.startsAt = startsAt
    this.touch()
  }

  set endsAt(endsAt: Date) {
    this.props.endsAt = endsAt
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(props: Optional<TripProps, 'createdAt'>, id?: UniqueEntityID) {
    const trip = new Trip(
      {
        ...props,
        createdAt: new Date(),
      },
      id,
    )

    return trip
  }
}

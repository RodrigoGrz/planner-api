import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'
import { Activity } from '../activity'

export interface TripWithActivitiesProps {
  tripId: UniqueEntityID
  destination: string
  startsAt: Date
  endsAt: Date
  createdAt: Date
  updatedAt?: Date | null
  activities: Activity[]
}

export class TripWithActivities extends ValueObject<TripWithActivitiesProps> {
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

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get activities() {
    return this.props.activities
  }

  static create(props: TripWithActivitiesProps) {
    return new TripWithActivities(props)
  }
}

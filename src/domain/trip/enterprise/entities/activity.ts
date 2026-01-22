import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface ActivityProps {
  title: string
  occursAt: Date
  tripId: UniqueEntityID
}

export class Activity extends Entity<ActivityProps> {
  get title() {
    return this.props.title
  }

  get occursAt() {
    return this.props.occursAt
  }

  get tripId() {
    return this.props.tripId
  }

  static create(props: ActivityProps, id?: UniqueEntityID) {
    const activity = new Activity(props, id)

    return activity
  }
}

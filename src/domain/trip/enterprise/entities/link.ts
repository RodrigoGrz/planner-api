import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface LinkProps {
  title: string
  url: string
  tripId: UniqueEntityID
}

export class Link extends Entity<LinkProps> {
  get title() {
    return this.props.title
  }

  get url() {
    return this.props.url
  }

  get tripId() {
    return this.props.tripId
  }

  static create(props: LinkProps, id?: UniqueEntityID) {
    const link = new Link(props, id)

    return link
  }
}

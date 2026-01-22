import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface TravelerProps {
  name: string
  email: string
  phone: string
  password: string
}

export class Traveler extends Entity<TravelerProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get phone() {
    return this.props.phone
  }

  get password() {
    return this.props.password
  }

  set password(password: string) {
    this.props.password = password
  }

  static create(props: TravelerProps, id?: UniqueEntityID) {
    const traveler = new Traveler(props, id)

    return traveler
  }
}

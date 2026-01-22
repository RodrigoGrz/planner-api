import { Link } from '../../enterprise/entities/link'

export interface LinksRepository {
  create(link: Link): Promise<void>
  findAllByTripId(tripId: string): Promise<Link[]>
}

import { Link } from '../../enterprise/entities/link'

export interface LinksRepository {
  create(link: Link): Promise<void>
  findById(id: string): Promise<Link | null>
  findAllByTripId(tripId: string): Promise<Link[]>
  delete(id: string): Promise<void>
}

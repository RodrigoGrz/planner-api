import { LinksRepository } from '@/domain/trip/application/repositories/links-repository'
import { Link } from '@/domain/trip/enterprise/entities/link'

export class FakeLinksRepository implements LinksRepository {
  public items: Link[] = []

  async create(link: Link): Promise<void> {
    this.items.push(link)
  }

  async findAllByTripId(tripId: string): Promise<Link[]> {
    return this.items.filter((item) => item.tripId.toString() === tripId)
  }
}
